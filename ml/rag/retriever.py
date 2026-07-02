import os
import json
import numpy as np
import faiss

from sentence_transformers import SentenceTransformer

# project root
ROOT_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

VECTOR_DIR = os.path.join(ROOT_DIR, "ml", "vector_search")

INDEX_PATH = os.path.join(VECTOR_DIR, "repository.faiss")
CHUNKS_PATH = os.path.join(VECTOR_DIR, "repository_chunks.json")

print("Loading FAISS from:", INDEX_PATH)
print("Loading chunks from:", CHUNKS_PATH)

model = SentenceTransformer("all-MiniLM-L6-v2")

index = faiss.read_index(INDEX_PATH)

with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunks = json.load(f)


def retrieve_context(
    query,
    top_k=3
):

    query_embedding = model.encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding,
        top_k
    )

    results = []

    for idx in indices[0]:
        if idx == -1:
            continue

        results.append(chunks[idx])

    return results