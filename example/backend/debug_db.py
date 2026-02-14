from app.supabase_client import supabase

def debug_db():
    d = supabase.table('debates').select('id, title').execute().data
    r = supabase.table('reports').select('id, title, status').execute().data
    m = supabase.table('messages').select('id').execute().data
    
    print(f"\n--- DATABASE STATUS ---")
    print(f"DEBATES: {len(d)}")
    for x in d:
        print(f"  - {x['id']}: {x['title']}")
    
    print(f"REPORTS: {len(r)}")
    for x in r:
        print(f"  - {x['id']}: {x['status']} | {x['title']}")
        
    print(f"MESSAGES total: {len(m)}")
    print(f"------------------------\n")

if __name__ == "__main__":
    debug_db()
