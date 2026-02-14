
import os
import asyncio
from typing import List, Literal
from dotenv import load_dotenv
from supabase import create_client, Client
from pydantic import BaseModel, Field
from pydantic_ai import Agent

# Importuj model skonfigurowany w projekcie
from app.agents.base import model

# Załaduj zmienne środowiskowe
load_dotenv()

# Konfiguracja Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Brak zmiennych SUPABASE w .env")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Modele Danych ---

from app.models.debate import AgentMessage, DebateResult
from app.agents.orchestrator import debate_agent

async def main():
    print("--- 🕵️‍♂️ Bieg Wsteczny: Silnik Debaty (End-to-End) ---")

    res = supabase.table('reports').select('*').eq('status', 'approved').execute()
    reports = res.data

    if not reports:
        print("ℹ️ Brak zgłoszeń.")
        return

    for report in reports:
        print(f"📝 Analiza: {report['title']}...")
        
        # Sprawdź czy już istnieje
        existing = supabase.table('debates').select('id').eq('external_id', report['id']).execute()
        if existing.data:
            print("⚠️ Debata już istnieje. Pomijam.")
            continue

        prompt = f"Tytuł: {report['title']}\nOpis: {report['content']}"
        
        try:
            # Używamy output_type i .output (zgodnie z systemem użytkownika)
            result = await debate_agent.run(prompt, output_type=DebateResult)
            debate_data = result.output

            print(f"✅ Sukces. Score: {debate_data.absurd_score}")

            new_debate = {
                "external_id": report['id'],
                "title": f"ANALIZA: {report['title']}",
                "summary": debate_data.summary,
                "absurd_score": debate_data.absurd_score,
                "status": "active",
                "tags": debate_data.tags
            }

            db_res = supabase.table('debates').insert(new_debate).execute()
            debate_id = db_res.data[0]['id']

            msgs = []
            for m in debate_data.messages:
                msgs.append({
                    "debate_id": debate_id,
                    "agent_id": m.agent_id,
                    "agent_name": m.agent_id.capitalize(),
                    "role": "AGENT",
                    "content": m.content,
                    "message_type": m.message_type
                })
            
            supabase.table('messages').insert(msgs).execute()
            print(f"💾 Zapisano {len(msgs)} wypowiedzi.")

        except Exception as e:
            print(f"❌ Błąd: {e}")

if __name__ == "__main__":
    asyncio.run(main())
