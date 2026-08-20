from fastapi import APIRouter, HTTPException
from app.models.schemas import TranslateRequest
from app.services.translation_service import translate_text
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger()

@router.post("/translate")
async def translate(request: TranslateRequest):
    try:
        result = translate_text(request.text, request.language)
        return {"translated_text": result}
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        raise HTTPException(status_code=500, detail="Translation failed.")
