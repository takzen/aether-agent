-- Schemat bazy danych dla projektu Bieg Wsteczny

-- Tabela debat
CREATE TABLE IF NOT EXISTS debates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL, -- np: ABS-321
    title TEXT NOT NULL,
    summary TEXT,
    absurd_score DECIMAL(3, 1) DEFAULT 0.0,
    status TEXT DEFAULT 'active', -- active, completed, archived
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela wiadomości w debacie (głosy agentów)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- discovery, legal, psych, history, tech, bureaucrat, audit
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- Tabela rankingowa (opcjonalnie, można liczyć w locie)
CREATE TABLE IF NOT EXISTS agent_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    score DECIMAL(3, 1),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela zgłoszeń użytkowników (Dyżur Obywatelski)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    location TEXT, -- miejsce zdarzenia
    category TEXT DEFAULT 'uncategorized', -- biurokracja, prawo, zdrowie, inne
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    contact_email TEXT, -- opcjonalnie
    admin_notes TEXT, -- notatki admina (Ciebie)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Funkcja do odświeżania updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_debates_modtime
    BEFORE UPDATE ON debates
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
