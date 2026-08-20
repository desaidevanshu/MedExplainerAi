from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pathlib import Path
import time
import uuid
import os

from app.config import settings
from app.utils.logger import get_logger
from app.utils.auth import init_firebase

logger = get_logger()

app = FastAPI(
    title="MedExplain AI",
    description="Medical Report Simplifier using GenAI + RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_firebase()

os.makedirs(settings.temp_upload_dir, exist_ok=True)

@app.on_event("startup")
async def startup_event():
    try:
        from app.services.rag_service import load_index
        load_index()
        logger.info("RAG index loaded on startup.")
    except Exception as e:
        logger.error(f"Failed to load RAG index on startup: {e}")

@app.get("/api/health", response_model=dict)
async def health():
    rag_status = "not_ready"
    try:
        from app.services.rag_service import get_rag_status
        rag_status = get_rag_status()
    except Exception:
        pass

    ocr_status = "unavailable"
    try:
        import easyocr
        ocr_status = "available"
    except Exception:
        pass

    return {
        "status": "ok" if rag_status == "ready" else "degraded",
        "service": "MedExplain AI",
        "llm": "connected",
        "rag": rag_status,
        "ocr": ocr_status,
    }

from app.routers import upload, analyze, explain, chat, translate

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(explain.router, prefix="/api", tags=["explain"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(translate.router, prefix="/api", tags=["translate"])

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": True, "code": "INTERNAL_ERROR", "message": "An unexpected error occurred."},
    )
