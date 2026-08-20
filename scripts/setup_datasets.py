import zipfile
import shutil
from pathlib import Path
from app.utils.logger import get_logger

logger = get_logger()

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DOWNLOADS_DIR = BASE_DIR / "data" / "downloads"
DATA_DIR = BASE_DIR / "data"

def extract_zip(zip_path: Path, target_dir: Path):
    target_dir.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as z:
        for member in z.namelist():
            target_path = target_dir / Path(member).name
            if not target_path.exists():
                with z.open(member) as source, open(target_path, "wb") as target:
                    shutil.copyfileobj(source, target)
    logger.info(f"Extracted {zip_path.name} -> {target_dir}")

def setup_datasets():
    print("=" * 35)
    print("MedExplain AI Dataset Setup")
    print("=" * 35)

    files = {
        "synthea_sample_data_csv_latest.zip": DATA_DIR / "synthea",
        "synthea_sample_data_fhir_stu3_latest.zip": DATA_DIR / "fhir",
        "MedQuAD-master.zip": DATA_DIR / "medquad",
        "mplus_topics_compressed_2026-08-18.zip": DATA_DIR / "medlineplus",
    }

    for name, target in files.items():
        path = DOWNLOADS_DIR / name
        if path.exists():
            print(f"{name}: FOUND")
            extract_zip(path, target)
        else:
            print(f"{name}: NOT FOUND")

    print("\nDataset setup complete.")

if __name__ == "__main__":
    setup_datasets()
