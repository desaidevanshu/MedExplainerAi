import httpx, os, json, re, sys
from dotenv import load_dotenv
load_dotenv()

sys.stdout.reconfigure(encoding='utf-8')

api_key = os.getenv('OPENAI_API_KEY')
base_url = os.getenv('OPENAI_BASE_URL')
model = os.getenv('LLM_MODEL')

prompt = """Return ONLY this exact JSON structure, no other text:
{
  "summary": "one sentence overall",
  "findings": [
    {
      "name": "test name",
      "explanation": "simple explanation",
      "possible_significance": "what it could mean",
      "doctor_questions": ["question 1", "question 2"]
    }
  ]
}

Tests:
HAEMOGLOBIN: 11.7 gm% (Ref: 12--16) [LOW]
R.B.C.Count: 3.62 mill/cmm (Ref: 4.5-5.5) [LOW]"""

payload = {
    'model': model,
    'messages': [
        {'role': 'system', 'content': 'You are a helpful medical assistant. Return ONLY valid JSON.'},
        {'role': 'user', 'content': prompt}
    ],
    'temperature': 0.3,
    'max_tokens': 1024
}

with httpx.Client(timeout=60) as client:
    resp = client.post(f'{base_url}/chat/completions', headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}, json=payload)
    data = resp.json()
    content = data.get('choices', [{}])[0].get('message', {}).get('content', '')
    print('Full response:')
    print(content)
    print('---')
    
    cleaned = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    start = cleaned.find('{')
    if start != -1:
        depth = 0
        for i, ch in enumerate(cleaned[start:], start):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    json_str = cleaned[start:i+1]
                    print('Extracted JSON:')
                    print(json_str)
                    try:
                        parsed = json.loads(json_str)
                        print('Parsed successfully!')
                        print(json.dumps(parsed, indent=2))
                    except Exception as e:
                        print('Parse error:', e)
                    break
