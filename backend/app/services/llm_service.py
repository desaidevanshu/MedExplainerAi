import json
import re
import httpx
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger()

SYSTEM_PROMPT = """You are MedExplain AI, a friendly medical information assistant.
Your ONLY job is to explain medical report results in simple, everyday language.
You are NOT a doctor. You do NOT diagnose. You do NOT prescribe.
Focus on what each test result means in plain English.
Be concise but warm.
Return ONLY valid JSON with this exact structure:
{
  "summary": "short overall summary",
  "findings": [
    {
      "name": "Test Name",
      "value": number,
      "unit": "unit",
      "reference_range": "range",
      "status": "NORMAL|LOW|HIGH|UNKNOWN",
      "explanation": "simple explanation of what this result means",
      "possible_significance": "what this could indicate",
      "doctor_questions": ["question 1", "question 2"],
      "sources": [{"title": "source name", "source": "MedlinePlus/MedQuAD"}]
    }
  ],
  "sources": [{"title": "source name", "source": "MedlinePlus/MedQuAD"}]
}"""

def get_llm_status() -> str:
    if settings.llm_provider == "openai_compatible":
        if not settings.openai_api_key:
            return "not_configured"
        try:
            with httpx.Client(timeout=10) as client:
                resp = client.get(
                    f"{settings.openai_base_url}/models",
                    headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                )
                if resp.status_code == 200:
                    return "connected"
        except Exception:
            pass
        return "not_configured"
    return "not_configured"

def _call_openai(prompt: str, max_tokens: int = None) -> str:
    max_tokens = max_tokens or settings.llm_max_tokens
    logger.info(f"Calling LLM model={settings.llm_model} max_tokens={max_tokens}")
    payload = {
        "model": settings.llm_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.3,
        "max_tokens": max_tokens,
    }
    try:
        with httpx.Client(timeout=120) as client:
            resp = client.post(
                f"{settings.openai_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                logger.info(f"LLM response length={len(content)}")
                return content
            else:
                logger.error(f"LLM error status={resp.status_code} body={resp.text[:300]}")
    except Exception as e:
        logger.error(f"LLM call failed: {e}")
    return ""

def _call_llm(prompt: str, max_tokens: int = None) -> str:
    return _call_openai(prompt, max_tokens=max_tokens)

def _clean_json_string(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```json"):
        raw = raw[7:]
    if raw.startswith("```"):
        raw = raw[3:]
    if raw.endswith("```"):
        raw = raw[:-3]
    raw = re.sub(r"<think>.*?</think>", "", raw, flags=re.DOTALL)
    raw = re.sub(r"Here's a thinking process:.*?Here's the final answer:", "", raw, flags=re.DOTALL)
    return raw.strip()

def _safe_log(text: str, max_len: int = 200) -> str:
    try:
        return text[:max_len]
    except Exception:
        return "[unloggable content]"

def _safe_log_unicode(text: str, max_len: int = 1000) -> str:
    try:
        return text[:max_len]
    except Exception:
        try:
            return text.encode('ascii', 'ignore').decode('ascii')[:max_len]
        except Exception:
            return "[unloggable content]"

def _extract_json(text: str) -> str:
    start = text.find('{')
    if start == -1:
        logger.info(f"_extract_json: no opening brace found")
        return ""
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                logger.info(f"_extract_json: found matching brace at position {i}, JSON length={i-start+1}")
                return text[start:i+1]
    logger.info(f"_extract_json: no matching closing brace found, final depth={depth}")
    return ""

LANGUAGE_PROMPTS: dict = {
    "en": "Respond entirely in English.",
    "hi": "Respond entirely in Hindi (हिंदी). Use Devanagari script for all explanations, summaries, and questions.",
    "mr": "Respond entirely in Marathi (मराठी). Use Devanagari script for all content.",
    "gu": "Respond entirely in Gujarati (ગુજરાતી). Use Gujarati script for all content.",
    "ta": "Respond entirely in Tamil (தமிழ்). Use Tamil script for all content.",
    "te": "Respond entirely in Telugu (తెలుగు). Use Telugu script for all content.",
    "bn": "Respond entirely in Bengali (বাংলা). Use Bengali script for all content.",
    "fr": "Respond entirely in French.",
    "de": "Respond entirely in German.",
    "es": "Respond entirely in Spanish.",
    "ar": "Respond entirely in Arabic. Use Arabic script and right-to-left conventions.",
}

def generate_explanation(findings: list, rag_context: str, language: str = "en") -> dict:
    abnormal = [f for f in findings if f.get("status") not in ("NORMAL", "UNKNOWN")][:12]

    findings_text = "\n".join([
        f"{f.get('name','')}: {f.get('value','')} {f.get('unit','')} (Ref: {f.get('reference_range','')}) [{f.get('status','')}]"
        for f in abnormal
    ])

    lang_instruction = LANGUAGE_PROMPTS.get(language, LANGUAGE_PROMPTS["en"])
    logger.info(f"Generating explanation in language={language}")

    prompt = f"""You are MedExplain AI — a warm, knowledgeable medical information assistant.
LANGUAGE INSTRUCTION: {lang_instruction}

Explain these abnormal test results in simple language for a patient.

Return valid JSON. Do not include any text before or after the JSON.
Use this exact structure:
{{
  "summary": "brief overall summary in 1-2 sentences",
  "overall_outcome": "A detailed 4-6 sentence paragraph synthesising ALL the abnormal results together. Explain how they might be connected, what the combined picture suggests for the patient's health, and what kinds of lifestyle or medical follow-up might help. End with an encouraging, warm note to consult their doctor.",
  "findings": [
    {{
      "name": "TEST NAME EXACTLY AS IT APPEARS IN INPUT",
      "explanation": "Write 4-6 clear, warm, human sentences: (1) what this test measures and why it matters for health, (2) what this specific number means and how far from the normal range it is, (3) what the body may be experiencing as a result, (4) common everyday factors that can cause this result. Use simple language.",
      "possible_significance": "2-3 sentences explaining which conditions or health issues this result is commonly associated with. Be informative but calm and not alarming.",
      "doctor_questions": ["specific relevant question 1", "specific relevant question 2", "specific relevant question 3"]
    }}
  ]
}}

Input (abnormal results to explain):
{findings_text if findings_text else 'No abnormal results. All results are within normal range.'}"""

    compact_note = ""
    for attempt in range(2):
        raw = _call_llm(prompt + compact_note, max_tokens=4096)
        logger.info(f"Raw LLM output length={len(raw)} (attempt {attempt+1})")
        try:
            cleaned = _clean_json_string(raw)
            json_str = _extract_json(cleaned)
            logger.info(f"Extracted JSON length={len(json_str)} (attempt {attempt+1})")
            with open('C:/Users/Devanshu/AppData/Local/Temp/kilo/llm_debug.txt', 'w', encoding='utf-8') as f:
                f.write(f"RAW:\n{raw}\n\nCLEANED:\n{cleaned}\n\nEXTRACTED:\n{json_str}\n")
            if json_str:
                parsed = json.loads(json_str)
                logger.info(f"Parsed JSON keys={list(parsed.keys())}, findings_count={len(parsed.get('findings', []))}")
                if "findings" in parsed and isinstance(parsed["findings"], list):
                    import difflib
                    
                    llm_map = {}
                    llm_names = []
                    for f in parsed["findings"]:
                        name = f.get("name", "")
                        clean_name = name.lower().strip()
                        if clean_name:
                            llm_map[clean_name] = f
                            llm_names.append(clean_name)

                    merged = []
                    for f in findings:
                        key = f.get("name", "").lower().strip()
                        matched = None
                        if key in llm_map:
                            matched = llm_map[key]
                        else:
                            # try close matches
                            matches = difflib.get_close_matches(key, llm_names, n=1, cutoff=0.5)
                            if matches:
                                matched = llm_map[matches[0]]
                            else:
                                import re
                                # fallback to subset / splits using regex to replace punctuation with spaces
                                clean_key = re.sub(r'[^\w\s]', ' ', key)
                                for part in clean_key.split():
                                    if part and len(part) >= 3:
                                        for llm_name in llm_names:
                                            if part in llm_name:
                                                matched = llm_map[llm_name]
                                                break
                                    if matched:
                                        break
                        
                        if matched:
                            merged_item = {**f, **matched}
                            for k in ('value', 'unit', 'reference_range', 'status'):
                                if k in f:
                                    merged_item[k] = f[k]
                            merged.append(merged_item)
                        else:
                            merged.append(f)
                    return {**parsed, "findings": merged}
        except Exception as e:
            logger.error(f"Failed to parse LLM JSON: {e}")
        if attempt == 0:
            compact_note = "\n\nIMPORTANT: Your previous response was truncated and not valid JSON. Output ONLY the JSON object with no extra text, and keep each explanation to 2-3 concise sentences."
    return {
        "summary": "Here is a simple explanation of your report results. Please discuss these with your doctor.",
        "findings": findings,
        "sources": [{"title": "Medical knowledge base", "source": "MedlinePlus/MedQuAD"}],
    }

def generate_chat_response(question: str, rag_context: str, report_id: str = None, language: str = "en", history: list = None) -> dict:
    lang_instruction = LANGUAGE_PROMPTS.get(language, LANGUAGE_PROMPTS["en"])
    
    history_str = ""
    if history:
        history_str = "\nConversation History:\n" + "\n".join([f"{msg.get('role', 'user').capitalize()}: {msg.get('text', '')}" for msg in history[-5:]]) + "\n"

    prompt = f"""You are a helpful medical information assistant.
LANGUAGE INSTRUCTION: {lang_instruction}

Context from medical sources:
{rag_context}
{history_str}
Patient question: {question}

Answer in simple, safe language. Do not diagnose. Do not prescribe.
Return JSON with keys: answer, sources."""
    raw = _call_llm(prompt)
    logger.info(f"Chat raw LLM output: {_safe_log_unicode(raw, 800)}")
    try:
        cleaned = _clean_json_string(raw)
        json_str = _extract_json(cleaned)
        if json_str:
            return json.loads(json_str)
    except Exception:
        pass
    return {"answer": "I don't have enough reliable information to answer that question. Please consult a healthcare professional.", "sources": []}
