from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger()
security = HTTPBearer()

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    if not settings.firebase_project_id or not settings.firebase_private_key:
        logger.warning("Firebase not fully configured. Running without authentication.")
        return
    try:
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "client_email": settings.firebase_client_email,
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        })
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized.")
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Optional[dict]:
    init_firebase()
    if not _firebase_initialized:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not configured.",
        )
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )
