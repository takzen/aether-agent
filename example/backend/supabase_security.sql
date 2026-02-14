-- SQL do uszczelnienia bazy danych w Supabase

-- 1. Włącz RLS dla wszystkich tabel
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE debates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 2. Polityka dla Zgłoszeń (Reports)
-- Pozwól każdemu na wysyłanie (Dyżur Obywatelski)
CREATE POLICY "Allow anonymous inserts to reports" 
ON reports FOR INSERT 
TO anon 
WITH CHECK (true);

-- Pozwól na odczyt tylko przez admina (Back-end/Panel)
-- Uwaga: Jeśli Twój backend używa Service Role Key, i tak będzie miał dostęp.
-- Ta polityka blokuje dostęp przez anonimowe zapytania API (np. z konsoli przeglądarki).
CREATE POLICY "Restrict reports read to authenticated" 
ON reports FOR SELECT 
TO authenticated 
USING (true);

-- 3. Polityka dla Debat (Debates)
-- Pozwól każdemu na czytanie debat (widok publiczny)
CREATE POLICY "Allow public read debates" 
ON debates FOR SELECT 
TO anon 
USING (status = 'active');

-- 4. Polityka dla Wiadomości (Messages)
-- Pozwól każdemu na czytanie wiadomości w debatach
CREATE POLICY "Allow public read messages" 
ON messages FOR SELECT 
TO anon 
USING (true);
