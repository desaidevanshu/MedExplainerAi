from app.services.safety_service import safety_check

def test_safety_check():
    resp = safety_check({"summary": "You have diabetes and should take 10mg metformin."})
    assert "consult" in resp["summary"].lower()
