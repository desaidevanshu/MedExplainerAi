import requests, json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

from app.services.llm_service import _call_llm, _clean_json_string, _extract_json
from app.services.rag_service import get_rag_context

file_id = '2814c18d-0927-4375-8e3d-73b50dcf50eb'
resp = requests.post('http://localhost:8000/api/analyze', json={'file_id': file_id, 'language': 'en'})
data = resp.json()

findings = [f for f in data.get('findings', []) if f.get('status') not in ('NORMAL', 'UNKNOWN')][:5]

findings_text = "\n".join([
    f"{f.get('name','')}: {f.get('value','')} {f.get('unit','')} (Ref: {f.get('reference_range','')}) [{f.get('status','')}]"
    for f in findings
])

# EXACT same prompt as in generate_explanation
prompt = f"""You are a medical information assistant.
Explain these abnormal test results in simple language for a patient.

Return valid JSON. Do not include any text before or after the JSON.
Use this exact structure:
{{
  "summary": "brief overall summary",
  "findings": [
    {{
      "name": "test name",
      "explanation": "1-2 simple sentences",
      "possible_significance": "what this could mean",
      "doctor_questions": ["question 1", "question 2"]
    }}
  ]
}}

Input:
{findings_text if findings_text else 'No abnormal results.'}"""

raw = _call_llm(prompt)
print('Raw length:', len(raw))
print('Raw response:')
print(raw)
print('---')

cleaned = _clean_json_string(raw)
print('Cleaned length:', len(cleaned))
print('Cleaned response:')
print(cleaned)
print('---')

json_str = _extract_json(cleaned)
print('Extracted JSON length:', len(json_str))
print('Extracted JSON:')
print(json_str)
print('---')

if json_str:
    try:
        parsed = json.loads(json_str)
        print('Parsed successfully!')
        print(json.dumps(parsed, indent=2))
    except Exception as e:
        print('Parse error:', e)
else:
    print('No JSON extracted')
