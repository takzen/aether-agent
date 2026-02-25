import pytest
import os
from ingest import split_text, process_content
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def mock_db():
    db = MagicMock()
    db.add_document_chunk = MagicMock()
    return db

@pytest.fixture
def mock_memory_manager(monkeypatch):
    mm = MagicMock()
    mm.get_embedding = AsyncMock(return_value=[0.1] * 3072)
    monkeypatch.setattr("ingest.memory_manager", mm)
    return mm

def test_split_text_basic():
    """Test the text splitting logic."""
    text = "Hello world. This is a test string."
    # Chunk size 10, overlap 2
    chunks = split_text(text, chunk_size=10, overlap=2)
    
    assert len(chunks) > 1
    assert chunks[0] == "Hello worl"
    # Overlap check: next start is 8. text[8:] is "rld. This is..."
    assert chunks[1].startswith("rl")

@pytest.mark.asyncio
async def test_process_content_flow(mock_db, mock_memory_manager):
    """Test the ingestion flow from text to DB storage."""
    content = "This is a long document that will be split into multiple chunks for embedding."
    filename = "test_doc.md"
    
    # Use small chunk size for testing
    from ingest import CHUNK_SIZE
    import ingest
    ingest.CHUNK_SIZE = 20 # Force splitting
    ingest.CHUNK_OVERLAP = 5
    
    success = await process_content(content, filename, mock_db)
    
    assert success is True
    assert mock_memory_manager.get_embedding.called
    assert mock_db.add_document_chunk.called
    
    # Check if first chunk call has correct metadata
    args, kwargs = mock_db.add_document_chunk.call_args_list[0]
    assert kwargs["metadata"]["source"] == filename
    assert kwargs["metadata"]["chunk_index"] == 0
