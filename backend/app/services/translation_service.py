from app.utils.logger import get_logger

logger = get_logger()

TRANSLATIONS = {
    "hi": {
        "summary": "सारांश",
        "normal": "सामान्य",
        "low": "कम",
        "high": "अधिक",
        "critical": "गंभीर",
        "unknown": "अज्ञात",
        "disclaimer": "मेडएक्सप्लेर्न एआई केवल शैक्षिक जानकारी प्रदान करता है और यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है।",
    },
    "mr": {
        "summary": "सारांश",
        "normal": "सामान्य",
        "low": "कम",
        "high": "अधिक",
        "critical": "गंभीर",
        "unknown": "अज्ञात",
        "disclaimer": "मेडएक्सप्लेर्न एआय केवल शैक्षणी माहिती प्रदान करते आहे आणि ते व्यावसायिक वैद्यकीय सल्ला बदलत नाही.",
    },
}

def translate_text(text: str, language: str) -> str:
    if language not in TRANSLATIONS:
        return text
    dictionary = TRANSLATIONS[language]
    for key, value in dictionary.items():
        text = text.replace(key, value)
    return text
