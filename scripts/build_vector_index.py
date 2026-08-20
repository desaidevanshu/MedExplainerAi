import sys
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))
from app.services.rag_service import build_index
from app.utils.logger import get_logger

logger = get_logger()

if __name__ == "__main__":
    print("Building RAG index...")
    build_index()
    print("RAG index created successfully.")
