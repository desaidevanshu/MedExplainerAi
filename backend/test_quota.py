import httpx
import os
from dotenv import load_dotenv
import json

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
model = os.getenv("LLM_MODEL", "openai/gpt-oss-120b")
url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1")

payload = {
    "model": model,
    "messages": [{"role": "user", "content": "Just a 5 token test to check API quota."}],
    "max_tokens": 15
}

print("====================================")
print(f"Checking API Quota for model: {model}")
print("====================================")
try:
    with httpx.Client(timeout=10) as client:
        resp = client.post(
            f"{url}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=payload
        )
        print(f"HTTP Status: {resp.status_code}")
        if resp.status_code == 200:
            print("API Quota is HEALTHY AND ACTIVE!")
            print("Response:", json.loads(resp.text)["choices"][0]["message"]["content"])
        elif resp.status_code == 429:
            print("API Quota is EXHAUSTED (RATE LIMITED)!")
            print(f"Error Payload: {resp.text}")
        else:
            print(f"Other Error: {resp.text}")
except Exception as e:
    print(f"Connection Failed: {e}")
print("====================================")
