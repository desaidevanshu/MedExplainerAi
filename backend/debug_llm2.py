import requests, json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

from app.services.llm_service import _clean_json_string, _extract_json

file_id = '2814c18d-0927-4375-8e3d-73b50dcf50eb'
resp = requests.post('http://localhost:8000/api/analyze', json={'file_id': file_id, 'language': 'en'})
data = resp.json()

# Manually test the LLM output extraction
from app.services.llm_service import _call_llm
from app.config import settings

findings = [f for f in data.get('findings', []) if f.get('status') not in ('NORMAL', 'UNKNOWN')][:5]
findings_text = "\n".join([
    f"{f.get('name','')}: {f.get('value','')} {f.get('unit','')} (Ref: {f.get('reference_range','')}) [{f.get('status','')}]"
    for f in findings
])

prompt = f"""You are a medical information assistant.
Explain these abnormal test results in simple language for a patient.

Return valid JSON with these keys:
- summary: brief overall summary
- findings: array of objects, each with:
  - name: test name
  - explanation: 1-2 simple sentences
  - possible_significance: what this could indicate
  - doctor_questions: array of 2 questions

Input:
{findings_text if findings_text else 'No abnormal results.'}"""

raw = _call_llm(prompt)
print('Raw length:', len(raw))
print('Raw preview:')
print(raw[:1500])
print('---')

cleaned = _clean_json_string(raw)
print('Cleaned preview:')
print(cleaned[:1000])
print('---')

json_str = _extract_json(cleaned)
print('Extracted JSON:')
print(json_str)
print('---')

try:
    parsed = json.loads(json_str)
    print('Parsed successfully!')
    print(json.dumps(parsed, indent=2))
except Exception as e:
    print('Parse error:', e)
