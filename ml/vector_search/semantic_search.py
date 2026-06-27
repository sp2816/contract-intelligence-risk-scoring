import json
import faiss
import numpy as np

from sentence_transformers import (
    SentenceTransformer
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def search_contract(
    query,
    top_k=3
):

    index = faiss.read_index(
        "ml/vector_search/contract_index.faiss"
    )

    with open(
        "ml/embeddings/sample_chunks.json",
        "r",
        encoding="utf-8"
    ) as f:

        chunks = json.load(
            f
        )

    query_embedding = model.encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding.astype("float32"),
        top_k
    )

    results = []

    for rank, idx in enumerate(indices[0]):

        results.append({

            "chunk":
            chunks[idx],

            "distance":
            float(distances[0][rank])
        })

    return results