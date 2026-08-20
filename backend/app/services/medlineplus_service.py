from pathlib import Path
from typing import List, Dict
from lxml import etree
from app.utils.logger import get_logger

logger = get_logger()

def load_medlineplus_documents() -> List[Dict]:
    docs = []
    data_dir = Path(__file__).resolve().parent.parent.parent.parent / "data" / "medlineplus"
    if not data_dir.exists():
        logger.warning("MedlinePlus directory not found.")
        return docs
    for xml_file in data_dir.rglob("*.xml"):
        try:
            tree = etree.parse(str(xml_file))
            root = tree.getroot()
            title = root.findtext(".//title", default="")
            summary = root.findtext(".//summary", default="")
            description = root.findtext(".//description", default="")
            text = f"{title}. {summary} {description}".strip()
            if text and len(text) > 20:
                docs.append({
                    "title": title,
                    "text": text,
                    "source": "MedlinePlus",
                    "url": root.findtext(".//url", default=""),
                })
        except Exception as e:
            logger.warning(f"Failed to parse {xml_file}: {e}")
    logger.info(f"Loaded {len(docs)} MedlinePlus documents.")
    return docs
