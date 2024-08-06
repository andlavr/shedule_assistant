import pytest
from starlette.testclient import TestClient

from manage import app

@pytest.fixture(scope="module")
def test_app():
    client = TestClient(app)
    yield client