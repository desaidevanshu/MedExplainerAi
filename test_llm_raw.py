import asyncio, os, sys
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from backend.app.services.llm_service import _call_llm

text = open('ocr_out.txt', 'r', encoding='utf-8').read()
prompt = f"""You are MedExplain AI.
Extract test findings into JSON:
{{
  "document_type": "string",
  "patient_information": {{}},
  "findings": [
    {{
      "name": "Test Name",
      "section": "General",
      "value": number,
      "raw_value": "string",
      "unit": "string",
      "reference_range": "string",
      "status": "NORMAL"
    }}
  ]
}}

Document Text:
{text}
"""
raw = _call_llm(prompt, max_tokens=2048)
print("RAW LLM OUTPUT:")
print(raw)
