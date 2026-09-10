from typing import Optional, List
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, ErrorResponse
from app.services.analysis_service import analyze_report
from app.utils.logger import get_logger
from app.utils.auth import get_current_user
from app.services.firestore_service import save_medical_report, get_medical_history, get_medical_report
from fastapi import APIRouter, HTTPException, Depends
import uuid

router = APIRouter()
logger = get_logger()

DEMO_TEXT = """
Patient: Demo Patient
Hemoglobin 10.8 g/dL Reference Range: 13.0 - 17.0 g/dL
WBC 11.2 x10^3/uL Reference Range: 4.5 - 11.0 x10^3/uL
Platelets 210 x10^3/uL Reference Range: 150 - 400 x10^3/uL
Glucose 95 mg/dL Reference Range: 70 - 100 mg/dL
Creatinine 1.1 mg/dL Reference Range: 0.7 - 1.3 mg/dL
TSH 3.2 mIU/L Reference Range: 0.4 - 4.0 mIU/L
Cholesterol 190 mg/dL Reference Range: <200 mg/dL
"""

@router.get("/demo")
async def get_demo():
    return {"text": DEMO_TEXT}

@router.post("/demo/analyze", response_model=AnalyzeResponse)
async def analyze_demo(language: str = "en"):
    try:
        result = await analyze_report(inline_text=DEMO_TEXT, language=language)
        return result
    except Exception as e:
        logger.error(f"Demo analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Demo analysis failed.")

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest, user: Optional[dict] = Depends(get_current_user)):
    try:
        result = await analyze_report(
            file_id=request.file_id, 
            language=request.language or "en",
            target_report=request.target_report
        )
        
        # Firestore saving logic
        if user and user.get("uid"):
            try:
                # Need an ID for the report. Using file_id or a new UUID.
                report_id = request.file_id or str(uuid.uuid4())
                save_payload = result.dict() if hasattr(result, "dict") else result
                
                # Assign a server-side timestamp or ID mapping
                import datetime
                save_payload["created_at"] = datetime.datetime.utcnow().isoformat()
                save_payload["report_id"] = report_id
                
                save_success = save_medical_report(user["uid"], report_id, save_payload)
                if not save_success:
                    logger.warning(f"Analysis completed but Firestore save failed for {report_id}")
            except Exception as e:
                logger.error(f"Error while attempting to save to Firestore: {e}")
                
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found.")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed.")
    finally:
        if request.file_id:
            import tempfile, glob, os
            upload_dir = os.path.join(tempfile.gettempdir(), "medexplain_uploads")
            for f in glob.glob(os.path.join(upload_dir, f"{request.file_id}.*")):
                try:
                    os.remove(f)
                    logger.info(f"Cleaned up temporary file: {f}")
                except Exception as del_err:
                    logger.warning(f"Failed to cleanup temp file {f}: {del_err}")

@router.get("/history")
async def get_history(user: dict = Depends(get_current_user)):
    if not user or not user.get("uid"):
        raise HTTPException(status_code=401, detail="Authentication required to view history.")
    return get_medical_history(user["uid"])

@router.get("/history/{report_id}")
async def get_report(report_id: str, user: dict = Depends(get_current_user)):
    if not user or not user.get("uid"):
        raise HTTPException(status_code=401, detail="Authentication required.")
    report = get_medical_report(user["uid"], report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report
