from app.services.llm_service import generate_explanation, get_llm_status

def test_llm_status():
    status = get_llm_status()
    assert status in ("connected", "not_configured")

def test_generate_explanation_structure():
    findings = [{"name": "Hemoglobin", "value": 10.8, "unit": "g/dL", "reference_range": "13.0-17.0", "status": "LOW"}]
    result = generate_explanation(findings, "")
    assert "summary" in result
    assert "findings" in result
    assert "sources" in result
