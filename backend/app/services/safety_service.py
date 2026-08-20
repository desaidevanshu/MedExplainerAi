import json
import re
from app.utils.logger import get_logger

logger = get_logger()

# Only block genuinely dangerous imperatives, not informational medical terms
UNSAFE_PATTERNS = [
    r"\btake\s+\d+\s*(mg|mcg|ml|tablets?|pills?)\b",  # direct dosage instruction
    r"\b(call\s+9[01][01]|call\s+112|go\s+to\s+(the\s+)?emergency)\b",  # emergency directives
    r"\byou\s+(have|are\s+suffering\s+from|suffer\s+from)\s+\w+\s+disease\b",  # definitive diagnosis
]

def safety_check(response: dict) -> dict:
    text = json.dumps(response) if isinstance(response, dict) else str(response)
    for pattern in UNSAFE_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            logger.warning(f"Unsafe content detected in LLM response (pattern: {pattern[:40]}).")
            if isinstance(response, dict):
                response["summary"] = (response.get("summary", "") or "") + " (Note: Please consult a qualified healthcare professional for medical advice.)"
            return response
    return response
