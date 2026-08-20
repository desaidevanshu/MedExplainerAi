from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_upload_invalid_type():
    resp = client.post("/api/upload", files={"file": ("test.txt", b"hello", "text/plain")})
    assert resp.status_code == 400
