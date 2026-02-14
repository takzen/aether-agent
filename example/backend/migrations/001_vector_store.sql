-- =============================================
-- VECTOR STORE MIGRATION FOR BIEG WSTECZNY
-- =============================================
-- Run this in Supabase SQL Editor

-- 1. Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create embeddings table
CREATE TABLE IF NOT EXISTS debate_embeddings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(768),  -- Gemini text-embedding-004 outputs 768 dimensions
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(debate_id)
);

-- 3. Create index for fast similarity search
CREATE INDEX IF NOT EXISTS debate_embeddings_embedding_idx 
ON debate_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 4. Create similarity search function
CREATE OR REPLACE FUNCTION match_debates(
    query_embedding vector(768),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    debate_id UUID,
    content TEXT,
    metadata JSONB,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.id,
        de.debate_id,
        de.content,
        de.metadata,
        1 - (de.embedding <=> query_embedding) AS similarity
    FROM debate_embeddings de
    WHERE 1 - (de.embedding <=> query_embedding) > match_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 5. Enable RLS (Row Level Security) for public read access
ALTER TABLE debate_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read embeddings
CREATE POLICY "Public read access for embeddings"
ON debate_embeddings FOR SELECT
USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Service role full access"
ON debate_embeddings FOR ALL
USING (auth.role() = 'service_role');

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
-- Check if extension is enabled:
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'debate_embeddings';

-- Test function (after inserting data):
-- SELECT * FROM match_debates('[0.1, 0.2, ...]'::vector(768), 0.5, 3);
