import re
from typing import List, Dict
from app.utils.logger import get_logger

logger = get_logger()

HEADERS = {
    "investigation", "result", "unit", "bio. ref. interval",
    "complete blood count", "blood counts", "wbc differential count",
    "rbc indices", "rbc's morphology", "wbc's morphology",
    "platelet's on smear", "blood indices"
}

NOISE_PATTERNS = [
    re.compile(r"^page\s*\d+", re.IGNORECASE),                        # "Page 5 of 7"
    re.compile(r"^\d+\s*of\s*\d+$", re.IGNORECASE),                   # "5 of 7"
    re.compile(r"date|time|report|lab|patient|doctor|name|age|sex|gender|address|phone|sample|barcode|accession|ref\.?\s*no|visit|specimen|collection|received|printed|authorised|technician|pathologist|signature", re.IGNORECASE),
    re.compile(r"^(result|value|units?|range|normal|flag|method|remarks?)$", re.IGNORECASE),
    re.compile(r"^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$"),                   # dates
    re.compile(r"^\s*$"),                                               # blank names
]

def _is_noise_name(name: str) -> bool:
    """Return True if the extracted name looks like PDF noise, not a real test."""
    name_stripped = name.strip()
    for pat in NOISE_PATTERNS:
        if pat.search(name_stripped):
            return True
    # Reject names that start with a digit (page numbers, serial numbers)
    if name_stripped and name_stripped[0].isdigit():
        return True
    # Reject very short names (less than 3 chars) or overly long
    if len(name_stripped) < 3 or len(name_stripped) > 60:
        return True
    # Reject if name has no alphabetic chars at all
    if not any(c.isalpha() for c in name_stripped):
        return True
    # Reject names that are only 1 word and <= 2 chars
    words = name_stripped.split()
    if len(words) == 1 and len(words[0]) <= 2:
        return True
    return False

def extract_medical_tests(text: str) -> List[Dict]:
    findings = []
    patterns = [
        r"(?P<name>[A-Za-z\s\(\)\.\*]+?)\s+(?P<value>-?\d+\.?\d*)\s*(?P<unit>[a-zA-Z/%µμ\*\.]+)\s+(?P<ref>[0-9\.,\-–\s]+)",
        r"(?P<name>[A-Za-z\s\(\)]+?)\s+(?P<value>-?\d+\.?\d*)\s*(?P<unit>[a-zA-Z/%µμ]*)\s*[\(\[]?\s*Reference\s+Range[:\s]+(?P<ref>[^\)\]\n]+)[\)\]]?",
        r"(?P<name>[A-Za-z\s\(\)]+?)\s+(?P<value>-?\d+\.?\d*)\s*(?P<unit>[a-zA-Z/%µμ]*)\s*[\-]\s*(?P<ref_low>\d+\.?\d*)\s*[-–]\s*(?P<ref_high>\d+\.?\d*)\s*(?P<unit2>[a-zA-Z/%µμ]*)",
        r"(?P<name>[A-Za-z\s\(\)]+?)\s+(?P<value>-?\d+\.?\d*)\s*(?P<unit>[a-zA-Z/%µμ]*)\s*Reference\s+Range[:\s]+(?P<ref>[^\)\]\n]+)",
    ]
    seen = set()
    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            name = match.group("name").strip().replace("\n", " ")
            if "\n" in match.group("name"):
                name = match.group("name").strip().split("\n")[-1]
            if name.lower() in HEADERS:
                continue
            if _is_noise_name(name):
                continue
            value = float(match.group("value"))
            unit = match.group("unit") if "unit" in match.groupdict() and match.group("unit") else ""
            if "unit2" in match.groupdict() and match.group("unit2") and not unit:
                unit = match.group("unit2")
            if "ref" in match.groupdict() and match.group("ref"):
                ref = match.group("ref").replace(" ", "").replace("\n", "").strip()
            elif "ref_low" in match.groupdict() and "ref_high" in match.groupdict():
                ref = f"{match.group('ref_low')}-{match.group('ref_high')}"
            else:
                ref = ""
            key = (name.lower(), value, unit.lower())
            if key in seen:
                continue
            seen.add(key)
            status = classify_status(value, ref)
            findings.append({
                "name": name,
                "value": value,
                "raw_value": match.group("value"),
                "unit": unit,
                "reference_range": ref,
                "status": status,
                "explanation": "",
                "possible_significance": "",
                "doctor_questions": [],
                "sources": [],
            })
    return findings

def classify_status(value: float, ref_range: str) -> str:
    if not ref_range:
        return "UNKNOWN"
    try:
        cleaned = ref_range.replace(" ", "").replace("gm%", "").replace("mg/dL", "").replace("mmol/L", "").replace("/cumm", "").replace("cumm", "").replace("mill/cmm", "").replace("cv%", "").replace("%", "").replace("g/dL", "").replace("dl", "").replace("fl", "").replace("pg", "")
        cleaned = re.sub(r"[-–]+", "-", cleaned)
        parts = cleaned.split("-")
        if len(parts) == 2:
            low = float(parts[0])
            high = float(parts[1])
            if value < low:
                return "LOW"
            elif value > high:
                return "HIGH"
            return "NORMAL"
    except Exception:
        pass
    return "UNKNOWN"
