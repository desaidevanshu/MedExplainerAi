from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger()
security = HTTPBearer(auto_error=False)

_firebase_initialized = False

def init_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        if settings.firebase_credentials_path:
            import os
            path = os.path.abspath(settings.firebase_credentials_path)
            cred = credentials.Certificate(path)
            firebase_admin.initialize_app(cred)
        elif settings.firebase_project_id and settings.firebase_private_key:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "client_email": settings.firebase_client_email,
                "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            })
            firebase_admin.initialize_app(cred)
        else:
            logger.warning("Firebase not fully configured. Running without authentication.")
            return
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized.")
    except Exception as e:
        logger.error(f"Firebase init failed: {e}")

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[dict]:
    init_firebase()
    if not _firebase_initialized or not credentials:
        return None
        
    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception as e:
        logger.warning(f"Token verification failed: {e}. Falling back to unauthenticated mode.")
        return None
