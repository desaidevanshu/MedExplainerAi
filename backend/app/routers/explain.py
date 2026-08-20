from fastapi import APIRouter, HTTPException
from app.models.schemas import ExplainRequest
from app.services.rag_service import get_rag_context
from app.services.llm_service import generate_explanation
from app.services.safety_service import safety_check
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger()

@router.post("/explain")
async def explain(request: ExplainRequest):
    try:
        context = get_rag_context(f"{request.finding_name} medical test explanation")
        llm_response = generate_explanation([{"name": request.finding_name}], context)
        final_response = safety_check(llm_response)
        return final_response
    except Exception as e:
        logger.error(f"Explain failed: {e}")
        raise HTTPException(status_code=500, detail="Explanation failed.")
