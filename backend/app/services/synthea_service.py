import csv
from pathlib import Path
from typing import List, Dict, Optional
from app.utils.logger import get_logger

logger = get_logger()

def load_csv(filepath: str) -> List[Dict]:
    rows = []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(dict(row))
    except Exception as e:
        logger.warning(f"Failed to load {filepath}: {e}")
    return rows

def get_patients() -> List[Dict]:
    return load_csv(Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthea" / "patients.csv")

def get_observations() -> List[Dict]:
    return load_csv(Path(__file__).resolve().parent.parent.parent.parent / "data" / "synthea" / "observations.csv")

def get_lab_observations() -> List[Dict]:
    obs = get_observations()
    return [o for o in obs if "lab" in o.get("CATEGORY", "").lower() or "laboratory" in o.get("DESCRIPTION", "").lower()]

def get_patient_observations(patient_id: str) -> List[Dict]:
    obs = get_observations()
    return [o for o in obs if o.get("PATIENT") == patient_id]
