from app.services.rag_service import get_rag_status

def test_rag_status():
    status = get_rag_status()
    assert status in ("ready", "not_ready")
