from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_trending_tags():
    # Zbalansowana lista ok. 25 kluczowych tagów
    return [
        "LOGIKA_CYFROWA", "URZĄD_2.0", "BETONOZA", "EKOLOGIA", "FISKUS",
        "PAPIEROLOGIA", "PARADOKS_PRAWNY", "INFRASTRUKTURA", "SAMORZĄD",
        "EURO_ABSURD", "SŁUŻBA_ZDROWIA", "EDUKACJA", "TRANSPORT_PUBLICZNY",
        "ZUS_LOGIC", "PRZETARGI", "CYFRYZACJA", "WNIOSKI", "MIESZKALNICTWO",
        "ENERGETYKA", "SPRAWIEDLIWOŚĆ", "BIUROKRACJA", "SKANSEN_CYFROWY",
        "RELIKT_PRL", "PODATKI", "RODO"
    ]
