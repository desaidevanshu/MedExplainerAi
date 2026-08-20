import sys
import logging
from app.utils.logger import get_logger

logger = get_logger()
_reader = None

_user_site = None
try:
    import site
    _user_site = site.getusersitepackages()
    if _user_site not in sys.path:
        sys.path.append(_user_site)
except Exception:
    pass

def _get_reader():
    global _reader
    if _reader is None:
        try:
            import easyocr
            logger.info("Initializing EasyOCR reader (first run downloads models)...")
            _reader = easyocr.Reader(['en'], gpu=False)
            logger.info("EasyOCR reader initialized.")
        except Exception as e:
            logger.error(f"EasyOCR initialization failed: {e}")
            return None
    return _reader

def run_ocr_on_image(image) -> dict:
    reader = _get_reader()
    if reader is None:
        logger.error("EasyOCR not available.")
        return {"text": "", "confidence": 0.0, "method": "ocr"}
    try:
        logger.info("Running EasyOCR on image...")
        results = reader.readtext(image, detail=1, paragraph=False)
        texts = []
        confidences = []
        for bbox, text, conf in results:
            texts.append(text)
            confidences.append(conf)
        full_text = "\n".join(texts)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.7
        logger.info(f"EasyOCR completed text_length={len(full_text)} confidence={avg_conf:.2f}")
        return {"text": full_text.strip(), "confidence": round(avg_conf, 2), "method": "ocr"}
    except Exception as e:
        logger.error(f"EasyOCR failed: {e}")
        return {"text": "", "confidence": 0.0, "method": "ocr"}

def run_ocr(file_path: str) -> dict:
    reader = _get_reader()
    if reader is None:
        logger.error("EasyOCR not available.")
        return {"text": "", "confidence": 0.0, "method": "ocr"}
    try:
        logger.info(f"Running EasyOCR on file: {file_path}")
        results = reader.readtext(file_path, detail=1, paragraph=False)
        texts = []
        confidences = []
        for bbox, text, conf in results:
            texts.append(text)
            confidences.append(conf)
        full_text = "\n".join(texts)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.7
        logger.info(f"EasyOCR completed text_length={len(full_text)} confidence={avg_conf:.2f}")
        return {"text": full_text.strip(), "confidence": round(avg_conf, 2), "method": "ocr"}
    except Exception as e:
        logger.error(f"EasyOCR failed: {e}")
        return {"text": "", "confidence": 0.0, "method": "ocr"}
