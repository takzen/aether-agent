import pytest
import os
import aiosqlite
from local_db import SQLiteService

@pytest.fixture
def test_db_path(tmp_path):
    """Fixture for a temporary database path."""
    db_path = tmp_path / "test_aether.db"
    return str(db_path)

@pytest.fixture
def schema_path():
    """Fixture for the real schema path."""
    # Since we are in backend/tests, we look up one level
    return os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")

@pytest.fixture
async def sqlite_service(test_db_path, schema_path):
    """Fixture to initialize a fresh test database for each test."""
    service = SQLiteService(db_path=test_db_path, schema_path=schema_path)
    await service.init_db()
    return service
