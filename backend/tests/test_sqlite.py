import pytest
import asyncio
from datetime import datetime

@pytest.mark.asyncio
async def test_session_creation(sqlite_service):
    """Test creating a session and verifying it exists."""
    title = "Test Debug Session"
    session_id = await sqlite_service.create_session(title=title)
    
    assert session_id is not None
    assert isinstance(session_id, str)
    
    sessions = await sqlite_service.get_sessions()
    assert len(sessions) > 0
    assert sessions[0]["id"] == session_id
    assert sessions[0]["title"] == title

@pytest.mark.asyncio
async def test_message_management(sqlite_service):
    """Test adding and retrieving messages in a session."""
    session_id = await sqlite_service.create_session("Message Test")
    
    # Add user message
    await sqlite_service.add_message(session_id, "user", "Hello Aether")
    # Add assistant message
    await sqlite_service.add_message(session_id, "assistant", "Hello! How can I help?", {"tool": "none"})
    
    messages = await sqlite_service.get_messages(session_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
    assert messages[1]["metadata"] == {"tool": "none"}

@pytest.mark.asyncio
async def test_system_logs(sqlite_service):
    """Test recording and retrieving system logs."""
    await sqlite_service.add_log("info", "TEST", "Testing log entry")
    await sqlite_service.add_log("error", "TEST", "Testing error entry")
    
    logs = await sqlite_service.get_logs(limit=10)
    assert len(logs) == 2
    assert logs[0]["type"] == "error" # DESC order
    assert logs[1]["type"] == "info"

@pytest.mark.asyncio
async def test_concept_constellations(sqlite_service):
    """Test graph memory (concepts and links)."""
    # Upsert concepts
    s_id = await sqlite_service.upsert_concept("Python", "language", "Core dev language")
    t_id = await sqlite_service.upsert_concept("FastAPI", "framework", "Web framework")
    
    assert s_id is not None
    assert t_id is not None
    
    # Add link
    await sqlite_service.add_concept_link("Python", "FastAPI", "USED_BY")
    
    graph = await sqlite_service.get_concept_graph()
    assert len(graph["nodes"]) == 2
    assert len(graph["links"]) == 1
    assert graph["links"][0]["source_name"] == "Python" 
    assert graph["links"][0]["target_name"] == "FastAPI"

@pytest.mark.asyncio
async def test_session_deletion(sqlite_service):
    """Test cascading deletion of a session."""
    session_id = await sqlite_service.create_session("Delete Me")
    await sqlite_service.add_message(session_id, "user", "Will be deleted")
    
    messages_before = await sqlite_service.get_messages(session_id)
    assert len(messages_before) == 1
    
    await sqlite_service.delete_session(session_id)
    
    sessions = await sqlite_service.get_sessions()
    assert all(s["id"] != session_id for s in sessions)
    
    # Since foreign_keys are ON in delete_session, messages should be gone
    messages_after = await sqlite_service.get_messages(session_id)
    assert len(messages_after) == 0
