import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Brak zmiennych środowiskowych Supabase. Funkcjonalność bazy danych może nie działać.');
}

// Jeśli brak zmiennych, używamy bezpiecznych placeholderów, aby uniknąć crasha aplikacji przy starcie.
// Błędy połączenia obsłuży komponent ReportView w bloku try/catch.
const safeSupabaseUrl = supabaseUrl || 'https://placeholder.supabase.co';
const safeSupabaseAnonKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(safeSupabaseUrl, safeSupabaseAnonKey);

