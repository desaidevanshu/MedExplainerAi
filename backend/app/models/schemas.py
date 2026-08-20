from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class HealthResponse(BaseModel):
    status: str
    service: str
    llm: str
    rag: str
    ocr: str

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    status: str

class AnalyzeRequest(BaseModel):
    file_id: str
    language: Optional[str] = "en"

class Finding(BaseModel):
    name: str
    value: Optional[float] = None
    raw_value: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: str = "UNKNOWN"
    explanation: str = ""
    possible_significance: str = ""
    doctor_questions: List[str] = []
    sources: List[Dict[str, str]] = []

class AnalyzeResponse(BaseModel):
    report_id: str
    extraction_method: str
    extraction_confidence: float
    summary: str
    statistics: Dict[str, int]
    findings: List[Finding]
    sources: List[Dict[str, str]]
    disclaimer: str

class ExplainRequest(BaseModel):
    report_id: str
    finding_name: str

class ChatRequest(BaseModel):
    report_id: Optional[str] = None
    question: str
    language: Optional[str] = "en"
    history: Optional[List[Dict[str, str]]] = []

class TranslateRequest(BaseModel):
    text: str
    language: str

class ErrorResponse(BaseModel):
    error: bool = True
    code: str
    message: str
