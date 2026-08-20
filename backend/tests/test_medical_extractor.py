from app.services.medical_extractor import extract_medical_tests, classify_status

def test_classify_status():
    assert classify_status(10.0, "12.0-15.0") == "LOW"
    assert classify_status(14.0, "12.0-15.0") == "NORMAL"
    assert classify_status(18.0, "12.0-15.0") == "HIGH"
    assert classify_status(14.0, "bad range") == "UNKNOWN"

def test_extract_medical_tests():
    text = "Hemoglobin 10.8 g/dL Reference Range: 13.0 - 17.0 g/dL"
    findings = extract_medical_tests(text)
    assert len(findings) > 0
    assert findings[0]["name"] == "Hemoglobin"
    assert findings[0]["status"] == "LOW"
