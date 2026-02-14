from fastapi import APIRouter, HTTPException, Response
from app.supabase_client import supabase
from app.services.social_service import generate_social_card

router = APIRouter()

@router.get("/card/{debate_id}.png")
async def get_debate_social_card(debate_id: str):
    """Generuje i zwraca obrazek Social Card dla danej debaty."""
    try:
        # Pobierz dane debaty z Supabase
        res = supabase.table('debates').select('title', 'absurd_score').eq('id', debate_id).execute()
        
        if not res.data:
            raise HTTPException(status_code=404, detail="Debata nie istnieje")
        
        debate = res.data[0]
        title = debate.get('title', 'Analiza Absurdu')
        score = debate.get('absurd_score', 0)
        
        # Generuj obrazek
        image_data = generate_social_card(title, score)
        
        return Response(content=image_data, media_type="image/png")
    except Exception as e:
        print(f"[SOCIAL_CARD] Error: {e}")
        raise HTTPException(status_code=500, detail="Błąd generowania obrazu")
