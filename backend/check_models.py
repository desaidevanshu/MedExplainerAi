import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
url = "https://api.groq.com/openai/v1/models"

try:
    with httpx.Client(timeout=10) as client:
        resp = client.get(url, headers={"Authorization": f"Bearer {api_key}"})
        if resp.status_code == 200:
            models = [m.get("id") for m in resp.json().get("data", [])]
            with open("active_models.txt", "w") as f:
                f.write("\n".join(models))
except Exception as e:
    pass
