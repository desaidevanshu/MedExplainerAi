try:
    import fitz
    HAS_FITZ = True
except Exception:
    HAS_FITZ = False

from app.utils.logger import get_logger

logger = get_logger()

def extract_pdf_text(file_path: str) -> dict:
    if not HAS_FITZ:
        logger.error("PyMuPDF not available.")
        return {"pages": [], "text": "", "method": "pdf_text", "confidence": 0.0}
    try:
        logger.info(f"Opening PDF file: {file_path}")
        doc = fitz.open(file_path)
        pages = []
        full_text = ""
        for i, page in enumerate(doc):
            text = page.get_text()
            pages.append({"page": i + 1, "text": text})
            full_text += text + "\n"
        doc.close()
        confidence = 0.95 if len(full_text.strip()) > 100 else 0.5
        logger.info(f"PDF extracted {len(pages)} pages, text_length={len(full_text)}, confidence={confidence}")
        return {"pages": pages, "text": full_text.strip(), "method": "pdf_text", "confidence": confidence}
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return {"pages": [], "text": "", "method": "pdf_text", "confidence": 0.0}
