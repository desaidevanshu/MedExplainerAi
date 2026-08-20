from app.services.pdf_service import extract_pdf_text

def test_extract_pdf_text():
    result = extract_pdf_text("nonexistent.pdf")
    assert result["method"] == "pdf_text"
    assert result["text"] == ""
    assert result["confidence"] == 0.0
