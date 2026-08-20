from fastapi import APIRouter
from app.models.schemas import AnalyzeResponse
from app.services.analysis_service import analyze_report
from app.utils.logger import get_logger

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

@router.get("/demo", response_model=dict)
async def get_demo_text():
    return {"text": DEMO_TEXT}

@router.post("/demo/analyze", response_model=AnalyzeResponse)
async def analyze_demo(language: str = "en"):
    try:
        result = await analyze_report(inline_text=DEMO_TEXT, language=language)
        return result
    except Exception as e:
        logger.error(f"Demo analysis failed: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail="Demo analysis failed.")
