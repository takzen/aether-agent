import asyncio
import random
import uuid
from app.supabase_client import supabase
from app.agents.orchestrator import debate_agent
from app.agents.scout import tavily_search
from app.models.debate import DebateResult
from app.services.vector_store import (
    store_debate_embedding, 
    get_context_for_debate
)

async def run_scout_research(topic: str) -> str:
    """Scout przeszukuje internet przed debatą."""
    try:
        results = await tavily_search(topic)
        if results and results[0].url:
            research_context = "\n\n📡 WYWIAD SCOUTA (źródła z sieci):\n"
            for i, r in enumerate(results[:3], 1):
                research_context += f"\n[{i}] {r.title}\n"
                research_context += f"    URL: {r.url}\n"
                research_context += f"    Treść: {r.content[:200]}...\n"
            return research_context
        return "\n\n📡 WYWIAD SCOUTA: Brak zewnętrznych źródeł. Analiza wewnętrzna.\n"
    except Exception as e:
        print(f"[SCOUT] Błąd wyszukiwania: {e}")
        return f"\n\n📡 WYWIAD SCOUTA: Błąd połączenia z siecią: {e}\n"

async def process_debate_stream(debate_id: str, report_id: str, prompt: str, title: str, source_url: str = None, use_tavily: bool = False):
    """Główna orkiestracja debaty AI (przeniesiona z API do serwisu)."""
    try:
        enriched_prompt = prompt
        
        # 1. RAG
        try:
            rag_context = await get_context_for_debate(title)
            if rag_context:
                enriched_prompt = f"{prompt}\n\n{rag_context}"
        except Exception as e:
            print(f"[RAG] Błąd: {e}")
        
        # 2. Scout Research
        if use_tavily:
            scout_research = await run_scout_research(title)
            enriched_prompt = f"{enriched_prompt}{scout_research}"
        
        # 3. AI Execution
        result = await debate_agent.run(enriched_prompt, output_type=DebateResult)
        debate_data = result.output

        # 4. Update Debate Header
        supabase.table('debates').update({
            "summary": debate_data.summary,
            "absurd_score": debate_data.absurd_score,
            "tags": debate_data.tags,
            "status": "active",
            "source_url": source_url
        }).eq('id', debate_id).execute()
        
        # 5. Message Streaming (Theatrical loop)
        created_messages = [] # Lista do mapowania indeksów na UUIDy
        
        for i, m in enumerate(debate_data.messages):
            await asyncio.sleep(random.uniform(1.5, 3.0))
            
            # Znajdź parent_id na podstawie parent_index
            parent_id = None
            if m.parent_index is not None and 0 <= m.parent_index < len(created_messages):
                parent_id = created_messages[m.parent_index]
            elif i > 0:
                # FALLBACK: Jeśli AI nie podało rodzica (ale to nie pierwsza wiadomość), 
                # przypnij do poprzedniej wiadomości, aby uniknąć "rozjechania" wątku.
                parent_id = created_messages[i-1]
            
            msg_payload = {
                "debate_id": debate_id,
                "agent_id": m.agent_id,
                "agent_name": m.agent_id.capitalize(),
                "role": "AGENT",
                "content": m.content,
                "message_type": m.message_type,
                "parent_id": parent_id
            }
            
            res = supabase.table('messages').insert(msg_payload).execute()
            if res.data:
                created_messages.append(res.data[0]['id'])
            else:
                # W razie błędu dodaj None, aby indeksy się zgadzały
                created_messages.append(None)

        # 6. Finalize Report
        supabase.table('reports').update({"status": "approved"}).eq('id', report_id).execute()
        
        # 7. Store Embedding
        try:
            await store_debate_embedding(debate_id, title, debate_data.summary, debate_data.tags)
        except Exception as e:
            print(f"[RAG] Save error: {e}")
            
    except Exception as e:
        print(f"[CRITICAL] Service Error: {e}")
        supabase.table('debates').update({"summary": f"BŁĄD_SYSTEMU: {str(e)}"}).eq('id', debate_id).execute()

async def create_debate_from_report(report_id: str, use_tavily: bool = False):
    """Inicjalizuje nową debatę na podstawie raportu, zachowując istniejące ID i głosy."""
    # 1. Sprawdź raport
    res = supabase.table('reports').select('*').eq('id', report_id).execute()
    if not res.data:
        return None
    report = res.data[0]
    title = report.get('title', 'Analiza Absurdu')
    
    # 2. Sprawdź czy debata już istnieje dla tego raportu (external_id)
    existing_debate = supabase.table('debates').select('id, confirmations').eq('external_id', report_id).execute()
    
    confirmations = 0
    if existing_debate.data:
        # Reużywamy istniejącego ID i zachowujemy głosy!
        debate_id = existing_debate.data[0]['id']
        confirmations = existing_debate.data[0].get('confirmations', 0)
        # Usuwamy tylko stare wiadomości dla tej konkretnej debaty
        supabase.table('messages').delete().eq('debate_id', debate_id).execute()
    else:
        # Całkowicie nowa debata
        debate_id = str(uuid.uuid4())

    # 3. Przygotuj szkielet (upsert zamiast delete/insert)
    skeleton = {
        "id": debate_id,
        "title": title,
        "summary": "INICJALIZACJA_DEBATY_AI...",
        "absurd_score": 0,
        "status": "loading",
        "external_id": report_id,
        "tags": [],
        "source_url": report.get('source_url'),
        "confirmations": confirmations # ZACHOWUJEMY GŁOSY
    }
    
    # Upsert nie nadpisze innych kolumn, jeśli nie są podane, 
    # a tutaj jawnie podajemy 'confirmations', które wcześniej pobraliśmy.
    supabase.table('debates').upsert(skeleton).execute()
    
    prompt = f"Temat: '{title}'\nOpis: {report.get('content', 'brak')}"
    if report.get('source_url'): prompt += f"\nŹródło: {report['source_url']}"
    
    # Zwracamy coroutine do odpalenia w tle
    return process_debate_stream(debate_id, report_id, prompt, title, report.get('source_url'), use_tavily)
