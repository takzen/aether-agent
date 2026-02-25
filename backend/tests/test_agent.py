import pytest
from pydantic_ai.models.test import TestModel
from agent import aether_agent, remember, recall, connect_concepts
from unittest.mock import AsyncMock, MagicMock
from pydantic_ai import RunContext

@pytest.fixture
def mock_deps():
    return {"session_id": "test-session", "search_count": 0}

@pytest.mark.asyncio
async def test_remember_tool_logic(mock_deps, monkeypatch):
    """Test the 'remember' tool function directly."""
    # Mock services used by the tool
    mock_sqlite = MagicMock()
    mock_sqlite.add_log = AsyncMock()
    monkeypatch.setattr("agent.sqlite_service", mock_sqlite)
    
    mock_mm = MagicMock()
    mock_mm.add_memory = AsyncMock(return_value={"status": "success", "id": "mem-123"})
    monkeypatch.setattr("agent.memory_manager", mock_mm)
    
    mock_db = MagicMock()
    monkeypatch.setattr("agent.db_service", mock_db)
    
    # Create mock RunContext
    ctx = MagicMock()
    ctx.deps = mock_deps
    
    # Call function directly
    result = await remember(ctx, "The user loves coffee", "preference")
    
    assert "Memory stored successfully" in result
    assert mock_mm.add_memory.called
    assert mock_sqlite.add_log.called

@pytest.mark.asyncio
async def test_recall_tool_logic(mock_deps, monkeypatch):
    """Test the 'recall' tool function directly."""
    mock_mm = MagicMock()
    mock_mm.search_relevant_memories = AsyncMock(return_value=[
        {"content": "user likes coffee", "similarity": 0.9}
    ])
    monkeypatch.setattr("agent.memory_manager", mock_mm)
    
    mock_db = MagicMock()
    monkeypatch.setattr("agent.db_service", mock_db)
    
    ctx = MagicMock()
    ctx.deps = mock_deps
    
    result = await recall(ctx, "What does the user like?")
    
    assert "user likes coffee" in result
    assert mock_mm.search_relevant_memories.called

@pytest.mark.asyncio
async def test_connect_concepts_logic(mock_deps, monkeypatch):
    """Test the 'connect_concepts' tool function."""
    mock_sqlite = MagicMock()
    mock_sqlite.add_concept_link = AsyncMock()
    mock_sqlite.add_log = AsyncMock()
    monkeypatch.setattr("agent.sqlite_service", mock_sqlite)
    
    ctx = MagicMock()
    ctx.deps = mock_deps
    
    result = await connect_concepts(ctx, "Python", "FastAPI", "uses")
    
    assert "Concepts connected" in result
    assert mock_sqlite.add_concept_link.called
