import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.services.ocr_service import run_ocr
from app.services.llm_service import extract_structured_data
from app.services.medical_extractor import extract_medical_tests

async def test_image(image_path: str):
    print(f"--- Testing {image_path} ---")
    ocr_res = run_ocr(image_path)
    text = ocr_res.get("text", "")
    print(f"OCR Text length: {len(text)}")
    print("OCR Text Snippet:", text[:200])
    
    print("\nExtracting structured data...")
    structured_data = extract_structured_data(text)
    print("Document Type:", structured_data.get("document_type"))
    print("LLM Findings count:", len(structured_data.get("findings", [])))
    
    print("\nRegex Findings count:")
    regex_f = extract_medical_tests(text)
    print(len(regex_f))

if __name__ == "__main__":
    asyncio.run(test_image("C:/Users/Devanshu/.gemini/antigravity/brain/b4690789-22f8-48a1-85ee-9099829efe00/uploaded_image_0_1787722905252.png"))
