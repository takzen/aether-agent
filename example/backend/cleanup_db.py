from app.supabase_client import supabase

def list_and_delete_debates():
    # 1. List debates
    res = supabase.table('debates').select('id, title').execute()
    debates = res.data
    
    if not debates:
        print("Brak debat w bazie.")
    else:
        print(f"Znaleziono {len(debates)} debat. Rozpoczynam czyszczenie...")

        for d in debates:
            debate_id = d['id']
            title = d['title']
            print(f"Przetwarzanie: {title} ({debate_id})")
            
            try:
                # Delete messages first
                supabase.table('messages').delete().eq('debate_id', debate_id).execute()
                # Delete debate
                supabase.table('debates').delete().eq('id', debate_id).execute()
                print(f"  [OK] Usunięto.")
            except Exception as e:
                print(f"  [BŁĄD] Nie udało się usunąć {debate_id}: {str(e)}")

    # Delete reports instead of resetting
    try:
        print("\nUsuwanie wszystkich raportów...")
        supabase.table('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print("Baza raportów wyczyszczona.")
    except Exception as e:
        print(f"Błąd podczas usuwania raportów: {str(e)}")

if __name__ == "__main__":
    list_and_delete_debates()
