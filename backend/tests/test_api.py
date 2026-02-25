import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import AsyncMock, MagicMock

@pytest.fixture
def client():
    return TestClient(app)

def test_ping(client):
    """Test the ping endpoint."""
    response = client.get("/ping")
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "pong", "version": "1.0.0"}

@pytest.mark.asyncio
async def test_get_stats_endpoint(client, monkeypatch):
    """Test the stats endpoint with mocked services."""
    mock_db = MagicMock()
    mock_db.get_stats.return_value = {"memories_count": 10, "documents_count": 5}
    
    mock_sqlite = MagicMock()
    # Mock get_logs as a coroutine (async)
    mock_sqlite.get_logs = AsyncMock(return_value=[{"type": "info"}, {"type": "error"}])
    mock_sqlite.get_sessions = AsyncMock(return_value=[1, 2, 3])
    
    # In main.py, db_service is imported from agent, sqlite_service from local_db
    monkeypatch.setattr("main.db_service", mock_db)
    monkeypatch.setattr("main.sqlite_service", mock_sqlite)
    
    response = client.get("/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["stats"]["memories_count"] == 10
    assert data["stats"]["reliability"] == 50.0
    assert data["stats"]["sessions_count"] == 3

def test_config_get(client, monkeypatch):
    """Test retrieving configuration."""
    mock_get_config = MagicMock(return_value={"KEY": "VAL"})
    monkeypatch.setattr("main.get_config", mock_get_config)
    
    response = client.get("/config")
    assert response.status_code == 200
    assert response.json()["config"] == {"KEY": "VAL"}

@pytest.mark.asyncio
async def test_ingest_endpoint(client, tmp_path, monkeypatch):
    """Test the file upload/ingest endpoint."""
    mock_source_dir = str(tmp_path / "knowledge")
    monkeypatch.setattr("ingest.SOURCE_DIR", mock_source_dir)
    
    # We also need to mock os.makedirs to not fail if it tries to create a real dir, 
    # though tmp_path handles it usually.
    
    mock_sqlite = MagicMock()
    mock_sqlite.add_log = AsyncMock()
    monkeypatch.setattr("main.sqlite_service", mock_sqlite)
    
    # Create a dummy file
    filename = "test.txt"
    content = b"Some test content"
    
    files = {"file": (filename, content, "text/plain")}
    response = client.post("/ingest", files=files)
    
    assert response.status_code == 200
    assert "uploaded successfully" in response.json()["message"]
    assert os.path.exists(os.path.join(mock_source_dir, filename))
import os
