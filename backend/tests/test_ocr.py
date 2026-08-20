from app.services.ocr_service import run_ocr

def test_ocr_missing_file():
    result = run_ocr("nonexistent.png")
    assert result["method"] == "ocr"
    assert result["text"] == ""
    assert result["confidence"] == 0.0
