from app.supabase_client import supabase
from datetime import datetime

def get_settings():
    """Pobiera ustawienia z bazy danych Supabase."""
    try:
        res = supabase.table('system_settings').select('*').eq('id', 1).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        
        # Jeśli jakimś cudem nie ma rekordu, zwróć domyślne (choć migracja powinna go stworzyć)
        return {
            "worker_enabled": True,
            "last_run": None,
            "cron_schedule": "0 6 * * *",
            "last_run_status": "success"
        }
    except Exception as e:
        print(f"Error getting settings from Supabase: {e}")
        return {
            "worker_enabled": True,
            "last_run": None,
            "cron_schedule": "0 6 * * *",
            "last_run_status": "success"
        }

def save_settings(settings):
    """Aktualizuje ustawienia w bazie danych Supabase."""
    try:
        # Przygotuj dane do aktualizacji (usuwamy id i updated_at)
        update_data = {
            "worker_enabled": settings.get("worker_enabled", True),
            "cron_schedule": settings.get("cron_schedule", "0 6 * * *"),
            "last_run": settings.get("last_run"),
            "last_run_status": settings.get("last_run_status", "success"),
            "updated_at": datetime.now().isoformat()
        }
        supabase.table('system_settings').update(update_data).eq('id', 1).execute()
    except Exception as e:
        print(f"Error saving settings to Supabase: {e}")

def update_last_run(status="success"):
    """Aktualizuje czas ostatniego uruchomienia i status."""
    try:
        update_data = {
            "last_run": datetime.now().isoformat(),
            "last_run_status": status,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table('system_settings').update(update_data).eq('id', 1).execute()
    except Exception as e:
        print(f"Error updating last run in Supabase: {e}")

def toggle_worker(enabled: bool):
    """Włącza/wyłącza automatycznego workera."""
    try:
        update_data = {
            "worker_enabled": enabled,
            "updated_at": datetime.now().isoformat()
        }
        supabase.table('system_settings').update(update_data).eq('id', 1).execute()
    except Exception as e:
        print(f"Error toggling worker in Supabase: {e}")
