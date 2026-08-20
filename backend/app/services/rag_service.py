import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict
from sentence_transformers import SentenceTransformer
import faiss
from app.config import settings
from app.services.medlineplus_service import load_medlineplus_documents
from app.services.medquad_service import load_medquad_documents
from app.utils.logger import get_logger

logger = get_logger()
_rag_ready = False
_index = None
_metadata = []

def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    chunks = []
    start = 0
    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += chunk_size - overlap
    return chunks

def build_index():
    global _rag_ready, _index, _metadata
    logger.info("Building RAG index...")
    docs = []
    docs.extend(load_medlineplus_documents())
    docs.extend(load_medquad_documents())
    if not docs:
        logger.warning("No documents loaded for RAG index.")
        _rag_ready = False
        return

    texts = []
    for doc in docs:
        chunks = _chunk_text(doc.get("text", ""))
        for chunk in chunks:
            texts.append(chunk)
            _metadata.append(doc)

    if not texts:
        logger.warning("No text chunks for embedding.")
        _rag_ready = False
        return

    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = model.encode(texts, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")
    faiss.normalize_L2(embeddings)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)

    index_path = Path(settings.faiss_index_path)
    metadata_path = Path(settings.faiss_metadata_path)
    index_path.parent.mkdir(parents=True, exist_ok=True)
    metadata_path.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(index_path))
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(_metadata, f)
    _index = index
    _rag_ready = True
    logger.info(f"RAG index built with {len(texts)} chunks.")

def load_index():
    global _rag_ready, _index, _metadata
    index_path = Path(settings.faiss_index_path)
    metadata_path = Path(settings.faiss_metadata_path)
    if not index_path.exists() or not metadata_path.exists():
        logger.warning("RAG index not found. Run build_vector_index.py.")
        _rag_ready = False
        return
    try:
        _index = faiss.read_index(str(index_path))
        with open(metadata_path, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
        _rag_ready = True
        logger.info("RAG index loaded.")
    except Exception as e:
        logger.error(f"Failed to load RAG index: {e}")
        _rag_ready = False

def get_rag_status() -> str:
    return "ready" if _rag_ready else "not_ready"

def get_rag_context(query: str, top_k: int = 3) -> str:
    if not _rag_ready or _index is None:
        return ""
    try:
        model = SentenceTransformer("all-MiniLM-L6-v2")
        q_emb = model.encode([query]).astype("float32")
        faiss.normalize_L2(q_emb)
        scores, indices = _index.search(q_emb, top_k)
        contexts = []
        for idx in indices[0]:
            if idx < len(_metadata):
                text = _metadata[idx].get("text", "")
                contexts.append(text[:3000] if len(text) > 3000 else text)
        context_str = "\n\n".join(contexts)
        logger.info(f"RAG retrieval complete. Total context length: {len(context_str)} chars.")
        return context_str
    except Exception as e:
        logger.error(f"RAG retrieval failed: {e}")
        return ""
