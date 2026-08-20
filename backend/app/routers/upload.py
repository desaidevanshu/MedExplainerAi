from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from app.models.schemas import UploadResponse
from app.services.upload_service import save_upload_file
from app.utils.logger import get_logger
import uuid

router = APIRouter()
logger = get_logger()

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
}

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: PDF, PNG, JPG, JPEG.")
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported MIME type.")

    file_id = str(uuid.uuid4())
    try:
        result = await save_upload_file(file, file_id)
        logger.info(f"Uploaded {file.filename} -> {file_id}")
        return JSONResponse(content={"file_id": result["file_id"], "filename": result["filename"], "status": "uploaded"})
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail="Upload failed.")
