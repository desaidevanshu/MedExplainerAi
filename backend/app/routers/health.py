from fastapi import APIRouter
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "MedExplain AI"}
