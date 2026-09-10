import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

prompt = """You are MedExplain AI, an expert medical document parser.
Extract ALL medical test results.

Return ONLY valid JSON with this exact structure:
{
  "document_type": "Liver Function Test",
  "patient_information": {},
  "findings": [
    {
      "name": "Total Bilirubin",
      "value": 1.33,
      "unit": "mg/dL",
      "reference_range": "0.2 - 1.3",
      "status": "HIGH"
    }
  ]
}

Document Text:
================
Total Bilirubin H 1.33 mg/dL 0.2 - 1.3
Direct Bilirubin H 0.99 mg/dL 0.1 - 0.4
Indirect Bilirubin 0.34 mg/dL 0.1 - 0.5
================
"""

payload = {
    "model": "qwen/qwen3.8-27b",
    "messages": [
        {"role": "user", "content": prompt},
    ],
    "temperature": 0.1,
    "max_tokens": 1000,
}

print("====================================")
try:
    with httpx.Client(timeout=10) as client:
        resp = client.post(
            f"https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        if resp.status_code == 200:
            print("Response:", resp.json()["choices"][0]["message"]["content"])
        else:
            print(f"Error {resp.status_code}: {resp.text}")
except Exception as e:
    print(f"Failed: {e}")
print("====================================")
