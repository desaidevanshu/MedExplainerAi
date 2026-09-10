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
    # Unconditional Multi-Model Array to natively bypass strict TPM rate limits and Payload ceilings!
    # Real Groq-supported model IDs — ordered by quality/size
    models_to_try = [
        settings.llm_model,           # primary from config (llama-3.3-70b-versatile)
        "llama-3.1-70b-versatile",     # stable Llama 70B fallback
        "llama3-70b-8192",             # Llama 3 70B
        "mixtral-8x7b-32768",          # Mixtral fallback
        "gemma2-9b-it",                # small but reliable
        "llama3-8b-8192",              # last resort small model
    ]
    api_key_header = f"Bearer {settings.openai_api_key}" if settings.openai_api_key else "Bearer none"
    
    for attempt, current_model in enumerate(models_to_try):
        logger.info(f"Calling API model={current_model} max_tokens={max_tokens} (Attempt {attempt+1}/{len(models_to_try)})")
        payload = {
            "model": current_model,
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
                    headers={"Authorization": api_key_header, "Content-Type": "application/json"},
                    json=payload,
                )
                
                # Bypass rate limits, capacity errors, and bad requests by trying next model
                if resp.status_code in [429, 413, 400, 503, 502, 504]:
                    logger.warning(f"Model {current_model} returned {resp.status_code}. Trying next fallback...")
                    continue
                    
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                    
                    # Intercept weak models hallucinating empty JSON arrays natively!
                    if attempt > 0 and '"findings": []' in content.replace(" ", ""):
                        logger.warning(f"Model {current_model} generated zero findings structurally. Hot-swapping to alternate...")
                        continue
                        
                    logger.info(f"LLM response length={len(content)}")
                    return content
                else:
                    logger.error(f"LLM API Error {resp.status_code} on model {current_model}: {str(resp.text[:200])}")
                    continue  # try next model instead of giving up
                    
        except Exception as e:
            logger.error(f"LLM execution halted natively: {e}")
            
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
    # Explain ONLY abnormal findings to save massive amounts of tokens. Normal findings will be queried on-demand.
    to_explain = [f for f in findings if str(f.get("status", "")).upper() not in ("NORMAL", "UNKNOWN")][:12]

    findings_text = "\n".join([
        f"{f.get('name','')}: {f.get('value','')} {f.get('unit','')} (Ref: {f.get('reference_range','')}) [{f.get('status','')}]"
        for f in to_explain
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
  "overall_outcome": "A detailed 4-6 sentence paragraph synthesizing ALL the abnormal results together. Clearly state what conditions this might indicate (e.g. possible Anemia, Jaundice, infections, etc.). Include practical precautions the patient should take immediately until they see the doctor. End with an encouraging, warm note to consult their doctor.",
  "findings": [
    {{
      "name": "TEST NAME EXACTLY AS IT APPEARS IN INPUT",
      "explanation": "Write 2-3 clear, warm sentences: (1) what this test measures and why it matters, (2) what this patient's specific number means. Use simple language.",
      "possible_significance": "1-2 sentences explaining what health conditions this result relates to.",
      "doctor_questions": ["specific relevant question 1", "specific relevant question 2"]
    }}
  ]
}}

Input (test results to explain):
{findings_text if findings_text else 'No test results found.'}"""

    compact_note = ""
    for attempt in range(2):
        raw = _call_llm(prompt + compact_note, max_tokens=1500)
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

def extract_structured_data(text: str, target_report: str = None) -> dict:
    import re
    # 1. Compress massive whitespace blocks
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r' {3,}', '  ', text)
    
    # 2. Chunk text and score by digit density. Medical tables are extremely dense in digits.
    # By picking disjoint chunks and reassembling chronologically, we safely capture widespread multi-page tables.
    chunk_size = 1500
    overlap = 150
    chunks = []
    
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunk_str = text[start:end]
        digit_count = sum(c.isdigit() for c in chunk_str)
        
        lower_chunk = chunk_str.lower()
        # Boost chunks containing actual clinical table headers/terms
        keywords = ['result', 'flag', 'reference', 'unit', 'test', 'value', 'range', 'hemoglobin', 'wbc', 'rbc', 'cholesterol', 'profile', 'biochemistry']
        keyword_score = sum(lower_chunk.count(kw) for kw in keywords) * 50
        
        # If user explicitly requested a specific target (e.g. "Urine"), forcefully boost chunks containing that term!
        if target_report and target_report != "AUTO":
            target_keys = target_report.lower().split()
            keyword_score += sum(lower_chunk.count(tk) for tk in target_keys) * 2000
        
        total_score = digit_count + keyword_score
        chunks.append({"text": chunk_str, "score": total_score, "index": len(chunks)})
        start += (chunk_size - overlap)
        
    # Sort chunks by overall clinical density (numbers + medical terms)
    chunks.sort(key=lambda x: x["score"], reverse=True)
    
    max_chars = 8000
    selected_chunks = []
    current_len = 0
    for c in chunks:
        if current_len + len(c["text"]) > max_chars:
            break
        # Only include chunks that have some clinical relevance or numbers
        if c["score"] < 10 and current_len > 1000:
            continue
        selected_chunks.append(c)
        current_len += len(c["text"])
        
    # Re-sort chronologically so the LLM reads top-to-bottom layout correctly
    selected_chunks.sort(key=lambda x: x["index"])
    text = "\n\n...[skipping non-tabular pages]...\n\n".join([c["text"] for c in selected_chunks])
    
    logger.info(f"Compressed PDF into {len(selected_chunks)} dense chunks. Final string length: {len(text)}")

    prompt = f"""You are MedExplain AI, an expert medical document parser.
Your task is to extract ALL medical test results, observations, and key information from the following text document.

TARGET FOCUS: Extract ONLY the findings relevant to >>> {target_report if target_report and target_report != 'AUTO' else 'All available medical tests'} <<<. Ignore other unrelated tests if a specific domain is targeted.

CRITICAL RULES:
1. ONLY extract information actually present in the document. NEVER hallucinate or invent values, reference ranges, or units.
2. If a value, unit, or reference range is missing, use null or omit the field.
3. Classify the document type appropriately (e.g., "CBC", "Lipid Profile", "Liver Function Test", "Mixed Report", etc.).
4. Group the findings into logical sections based on the report structure (e.g., "Hematology", "Biochemistry", "Thyroid Profile"). If sections are unclear, group them logically or use "General".
5. For "status", attempt to classify as "NORMAL", "LOW", "HIGH", "CRITICAL", or "UNKNOWN" based on the provided reference ranges.

Return ONLY valid JSON with this exact structure:
{{
  "document_type": "string",
  "patient_information": {{}},
  "findings": [
    {{
      "name": "Test Name",
      "section": "Section Name",
      "value": number (if applicable),
      "raw_value": "string representation",
      "unit": "string",
      "reference_range": "string",
      "status": "NORMAL|LOW|HIGH|CRITICAL|UNKNOWN"
    }}
  ]
}}

Document Text:
================
{text}
================"""
    
    logger.info(f"Calling LLM for structural extraction of document (Target: {target_report})...")
    raw = _call_llm(prompt, max_tokens=3000)
    
    try:
        cleaned = _clean_json_string(raw)
        json_str = _extract_json(cleaned)
        if json_str:
            parsed = json.loads(json_str)
            return parsed
    except Exception as e:
        logger.error(f"Failed to parse structured LLM JSON: {e}")
    
    return {"document_type": "Unknown Medical Report", "findings": []}

