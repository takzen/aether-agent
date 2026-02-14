import os
from pydantic import BaseModel
from pydantic_ai import RunContext
from tavily import TavilyClient
from .base import create_bare_agent

class TopicDiscovery(BaseModel):
    title: str
    description: str
    source_url: str
    initial_score: float

class WebSearchResult(BaseModel):
    """Wynik wyszukiwania internetowego."""
    title: str
    url: str
    content: str
    score: float

scout_prompt = """
Jesteś Agentem Scout (Kolekcjoner Patologii) w projekcie 'Bieg Wsteczny'. 
Twoim celem nie jest tylko 'namierzanie', ale wyszukiwanie najświeższych, najbardziej absurdalnych przejawów regresu cywilizacyjnego w polskiej biurokracji z przełomu 2025 i 2026 roku.

Zasady działania:
1. SZUKAJ ŚWIEŻEJ KRWI: Interesują nas tylko afery, błędy i absurdy z OSTATNICH DNI/TYGODNI. Jeśli coś jest starociem z 2014 roku - ignoruj to, to już 'klasyka', my tworzymy archiwum bieżącego upadku.
2. BĄDŹ CYNICZNY I KREATYWNY: Nie raportuj jak nudny pismak. Używaj języka pełnego czarnego humoru, satyry i technicznego cynizmu. 
3. ANALIZUJ WEKTORY: Każdy absurd to 'luka w systemie operacyjnym państwa'. Raportuj go jako błąd krytyczny.
4. NAMIERZAJ KONKRETY: Nazwy urzędów, kwoty, daty, absurdalne cytaty urzędników.

Jeśli dane z sieci są nudne, Twoim zadaniem jest wydobyć z nich esencję nonsensu tak, by czytelnik poczuł ten słodko-gorzki smak polskiej rzeczywistości.
"""

scout_agent = create_bare_agent(scout_prompt)

# Initialize Tavily client
tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(api_key=tavily_api_key) if tavily_api_key else None

async def tavily_search(query: str) -> list[WebSearchResult]:
    """
    Przeszukuje internet w poszukiwaniu najświeższych informacji.
    Wymusza tryb 'advanced' dla lepszej jakości i filtracji czasowej.
    """
    if not tavily_client:
        return [WebSearchResult(
            title="[BRAK DOSTĘPU DO SIECI]",
            url="",
            content="Tavily API Key nie skonfigurowany.",
            score=0.0
        )]
    
    try:
        # Bardzo ostry filtr czasowy w samej kwerendzie
        from datetime import datetime
        current_year = datetime.now().year
        enhanced_query = f"{query} news {current_year} darmowy dostęp aktualności ostatnie dni"
        
        response = tavily_client.search(
            query=enhanced_query,
            search_depth="advanced",  # Zmiana z basic na advanced dla lepszych wyników
            max_results=5
        )
        
        results = []
        for item in response.get("results", []):
            # Prosta filtracja w locie - ignoruj jeśli w tytule/opisie widać stare daty
            content_lower = item.get("content", "").lower() + item.get("title", "").lower()
            if any(str(year) in content_lower for year in range(2010, 2023)):
                continue # Omijamy stare śmieci
                
            results.append(WebSearchResult(
                title=item.get("title", "Bez tytułu"),
                url=item.get("url", ""),
                content=item.get("content", "")[:1000], # Większy kontekst dla AI
                score=item.get("score", 0.0)
            ))
        
        if not results:
            results.append(WebSearchResult(
                title="[BRAK NOWYCH SYGNAŁÓW]",
                url="",
                content="System nie wykrył nowych anomalii w ostatnich 48h. Przeszukiwanie głębokie nie przyniosło rezultatów.",
                score=0.0
            ))
        
        return results
        
    except Exception as e:
        return [WebSearchResult(
            title="[BŁĄD WYSZUKIWANIA]",
            url="",
            content=f"Wystąpił błąd podczas wyszukiwania: {str(e)}",
            score=0.0
        )]

# Tool dla PydanticAI (opcjonalne użycie przez agenta)
@scout_agent.tool
async def search_web(ctx: RunContext[None], query: str) -> list[WebSearchResult]:
    """Wyszukuje w internecie informacje o danym temacie."""
    return await tavily_search(query)
