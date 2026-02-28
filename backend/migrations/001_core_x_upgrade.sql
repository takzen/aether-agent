-- Migration: 001_core_x_upgrade.sql
-- Goal: Enhance Neural Topology with Confidence Scores and Vector Alignment

-- 1. Upgrade concepts table
ALTER TABLE concepts ADD COLUMN confidence REAL DEFAULT 1.0;
ALTER TABLE concepts ADD COLUMN vector_id TEXT;
ALTER TABLE concepts ADD COLUMN last_activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Upgrade concept_links (weight is already present, but ensured)
-- In SQLite we can't easily check column existence before ALTER without PRAGMA.
-- Assuming weight is already there based on previous schema viewing.

-- 3. Add index for performance on large graphs
CREATE INDEX IF NOT EXISTS idx_concepts_vector_id ON concepts(vector_id);
CREATE INDEX IF NOT EXISTS idx_concepts_confidence ON concepts(confidence);
