from firebase_admin import firestore
from app.utils.auth import init_firebase, _firebase_initialized
from app.utils.logger import get_logger

logger = get_logger()
db = None

def get_firestore_client():
    global db
    if db is not None:
        return db
    init_firebase()
    if _firebase_initialized:
        try:
            db = firestore.client()
            return db
        except Exception as e:
            logger.error(f"Firestore init failed: {e}")
            return None
    return None

def save_medical_report(user_id: str, report_id: str, data: dict) -> bool:
    client = get_firestore_client()
    if not client:
        logger.error("Cannot save report: Firestore not initialized.")
        return False
    try:
        doc_ref = client.collection("users").document(user_id).collection("medical_reports").document(report_id)
        doc_ref.set(data)
        logger.info(f"Saved medical report {report_id} to Firestore for user {user_id}")
        return True
    except Exception as e:
        logger.error(f"Failed to save report to Firestore: {e}")
        return False

def get_medical_history(user_id: str) -> list:
    client = get_firestore_client()
    if not client:
        return []
    try:
        docs = client.collection("users").document(user_id).collection("medical_reports").order_by("created_at", direction=firestore.Query.DESCENDING).stream()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        logger.error(f"Failed to get medical history: {e}")
        return []

def get_medical_report(user_id: str, report_id: str) -> dict:
    client = get_firestore_client()
    if not client:
        return None
    try:
        doc = client.collection("users").document(user_id).collection("medical_reports").document(report_id).get()
        return doc.to_dict() if doc.exists else None
    except Exception as e:
        logger.error(f"Failed to get specific report: {e}")
        return None

def delete_medical_report(user_id: str, report_id: str) -> bool:
    client = get_firestore_client()
    if not client:
        return False
    try:
        client.collection("users").document(user_id).collection("medical_reports").document(report_id).delete()
        return True
    except Exception as e:
        logger.error(f"Failed to delete medical report: {e}")
        return False
