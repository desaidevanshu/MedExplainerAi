from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest
from app.services.rag_service import get_rag_context
from app.services.llm_service import generate_chat_response
from app.services.safety_service import safety_check
from app.utils.logger import get_logger

router = APIRouter()
logger = get_logger()

@router.post("/chat")
async def chat(request: ChatRequest):
    try:
        context = get_rag_context(request.question)
        llm_response = generate_chat_response(request.question, context, request.report_id, request.language or "en", request.history)
        final_response = safety_check(llm_response)
        return final_response
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail="Chat failed.")
