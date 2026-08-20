import json
from pathlib import Path
from typing import List, Dict
from app.utils.logger import get_logger

logger = get_logger()

def load_medquad_documents() -> List[Dict]:
    docs = []
    data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "medquad"
    if not data_dir.exists():
        logger.warning("MedQuAD directory not found.")
        return docs
    for json_file in data_dir.rglob("*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "question" in item and "answer" in item:
                            docs.append({
                                "text": f"Q: {item['question']} A: {item['answer']}",
                                "question": item["question"],
                                "answer": item["answer"],
                                "source": "MedQuAD",
                                "topic": item.get("topic", ""),
                            })
        except Exception as e:
            logger.warning(f"Failed to load {json_file}: {e}")
    logger.info(f"Loaded {len(docs)} MedQuAD documents.")
    return docs
