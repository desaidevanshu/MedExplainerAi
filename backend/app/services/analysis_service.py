from app.services.pdf_service import extract_pdf_text
from app.services.ocr_service import run_ocr
from app.services.medical_extractor import extract_medical_tests
from app.services.rag_service import get_rag_context
from app.services.llm_service import generate_explanation, extract_structured_data
from app.services.safety_service import safety_check
from app.config import settings
from app.utils.logger import get_logger
from pathlib import Path
import uuid
import asyncio

logger = get_logger()

async def analyze_report(file_id: str = None, inline_text: str = None, language: str = "en", target_report: str = None) -> dict:
    if inline_text:
        text = inline_text
        method = "demo"
        confidence = 1.0
        logger.info("Analyzing demo report text.")
    else:
        if not file_id:
            raise ValueError("file_id or inline_text required")
        import tempfile
        upload_dir = Path(tempfile.gettempdir()) / "medexplain_uploads"
        matches = list(upload_dir.glob(f"{file_id}.*"))
        if not matches:
            raise FileNotFoundError("Uploaded file not found.")
        file_path = matches[0]

        logger.info(f"Analyzing report file={file_path.name} file_id={file_id}")

        pdf_result = extract_pdf_text(str(file_path))
        text = pdf_result.get("text", "")
        method = pdf_result.get("method", "pdf_text")
        confidence = pdf_result.get("confidence", 0.9)
        logger.info(f"PDF extraction method={method} confidence={confidence} text_length={len(text)}")

        if len(text.strip()) < 50:
            logger.info("Extracted text too short, falling back to OCR.")
            ocr_result = run_ocr(str(file_path))
            text = ocr_result.get("text", text)
            method = "ocr"
            confidence = ocr_result.get("confidence", 0.8)
            logger.info(f"OCR extraction method={method} confidence={confidence} text_length={len(text)}")
        else:
            logger.info("Using PDF extracted text, skipping OCR.")

    logger.info("Extracting medical tests from text...")
    regex_findings = extract_medical_tests(text)
    logger.info(f"Extracted {len(regex_findings)} medical findings via regex.")

    logger.info(f"Extracting intelligent structured data via LLM (Target: {target_report})...")
    structured_data = extract_structured_data(text, target_report=target_report)
    llm_findings = structured_data.get("findings", [])
    document_type = structured_data.get("document_type", "Unknown Medical Report")
    logger.info(f"Extracted {len(llm_findings)} medical findings via LLM. Document Type: {document_type}")

    # Merge findings (Regex + LLM) - prefer LLM as it handles varied structures better
    combined_findings = {f.get("name", "").lower(): f for f in regex_findings}
    for f in llm_findings:
        if f.get("name"):
            combined_findings[f.get("name", "").lower()] = f
    
    findings = list(combined_findings.values())

    if not findings:
        logger.warning("No medical data found. Returning partial structure.")
        return {
            "report_id": str(uuid.uuid4()),
            "document_type": document_type,
            "extraction_method": method,
            "extraction_confidence": confidence,
            "summary": "No reliable medical test data could be extracted from this document. It may be corrupted or an unsupported format.",
            "overall_outcome": "",
            "statistics": {"total": 0, "normal": 0, "low": 0, "high": 0, "critical": 0, "unknown": 0},
            "findings": [],
            "sources": [],
            "disclaimer": "MedExplain AI provides educational information and does not replace professional medical advice.",
        }

    logger.info("Retrieving RAG context...")
    rag_context = get_rag_context(text)
    logger.info(f"Retrieved RAG context length={len(rag_context)}")

    logger.info("Calling LLM for explanation...")
    llm_response = generate_explanation(findings, rag_context, language=language)
    logger.info("LLM response received.")
    final_response = safety_check(llm_response)

    stats = {"total": len(findings), "normal": 0, "low": 0, "high": 0, "critical": 0, "unknown": 0}
    for f in findings:
        s = f.get("status", "UNKNOWN").lower()
        if s in stats:
            stats[s] += 1

    report_id = str(uuid.uuid4())
    logger.info(f"Analysis complete report_id={report_id} document_type={document_type} stats={stats}")
    return {
        "report_id": report_id,
        "document_type": document_type,
        "extraction_method": method,
        "extraction_confidence": confidence,
        "summary": final_response.get("summary", ""),
        "overall_outcome": final_response.get("overall_outcome", ""),
        "statistics": stats,
        "findings": final_response.get("findings", findings),
        "sources": final_response.get("sources", []),
        "disclaimer": "MedExplain AI provides educational information and does not replace professional medical advice.",
    }
