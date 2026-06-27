import json
import numpy as np
import faiss

from sentence_transformers import (
    SentenceTransformer
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

index = faiss.read_index(
    "ml/vector_search/repository.faiss"
)

with open(
    "ml/vector_search/repository_chunks.json",
    "r",
    encoding="utf-8"
) as file:

    chunks = json.load(
        file
    )


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

        results.append(
            chunks[idx]
        )

    return results