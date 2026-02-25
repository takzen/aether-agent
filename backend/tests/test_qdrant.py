import pytest
import os
import shutil
from database import DatabaseService

@pytest.fixture
def test_qdrant_path(tmp_path):
    """Fixture for a temporary Qdrant storage path."""
    path = tmp_path / "qdrant_test"
    return str(path)

@pytest.fixture
def qdrant_service(test_qdrant_path, monkeypatch):
    """Fixture to initialize a fresh Qdrant service for each test."""
    # Mock environment variables to force local storage
    monkeypatch.setenv("QDRANT_URL", "")
    monkeypatch.setenv("QDRANT_API_KEY", "")
    monkeypatch.setenv("QDRANT_LOCAL_PATH", test_qdrant_path)
    
    service = DatabaseService()
    return service

def test_qdrant_initialization(qdrant_service):
    """Test if collections are created on init."""
    collections = qdrant_service.client.get_collections().collections
    collection_names = [c.name for c in collections]
    assert "memories" in collection_names
    assert "documents" in collection_names

def test_add_and_search_memory(qdrant_service):
    """Test adding a memory and searching for it."""
    content = "The secret passkey is Alpha-7"
    # Dummy embedding of size 3072 (all zeros except one)
    embedding = [0.0] * 3072
    embedding[0] = 1.0
    
    metadata = {"source": "test_suite"}
    
    # Add memory
    result = qdrant_service.add_memory(content, embedding, metadata)
    assert result["status"] == "success"
    
    # Search memory with the same vector
    search_results = qdrant_service.search_memories(embedding, match_threshold=0.8)
    assert len(search_results) > 0
    assert search_results[0]["content"] == content
    assert search_results[0]["metadata"]["source"] == "test_suite"

def test_document_chunk_management(qdrant_service):
    """Test adding and deleting document chunks."""
    content = "Chunk 1 of the manual"
    embedding = [0.0] * 3072
    embedding[1] = 1.0
    filename = "manual.pdf"
    
    # Add chunk
    qdrant_service.add_document_chunk(content, embedding, {"source": filename})
    
    # Verify it's there
    docs = qdrant_service.list_documents()
    assert any(d["filename"] == filename for d in docs)
    
    # Delete by filename
    qdrant_service.delete_document(filename)
    
    # Verify it's gone
    docs_after = qdrant_service.list_documents()
    assert all(d["filename"] != filename for d in docs_after)

def test_database_stats(qdrant_service):
    """Test stats retrieval."""
    qdrant_service.add_memory("M1", [0.1] * 3072)
    qdrant_service.add_document_chunk("D1", [0.2] * 3072)
    
    stats = qdrant_service.get_stats()
    assert stats["memories_count"] == 1
    assert stats["documents_count"] == 1
