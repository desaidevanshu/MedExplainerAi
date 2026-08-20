import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from app.config import settings

async def save_upload_file(file: UploadFile, file_id: str) -> dict:
    upload_dir = Path(settings.temp_upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix.lower()
    dest = upload_dir / f"{file_id}{ext}"
    content = await file.read()
    if len(content) > settings.max_file_size_mb * 1024 * 1024:
        raise ValueError("File too large.")
    with open(dest, "wb") as f:
        f.write(content)
    return {"file_id": file_id, "filename": file.filename, "path": str(dest)}
