import json
import faiss

from sentence_transformers import (
    SentenceTransformer
)

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def search_repository(
    query,
    top_k=5
):

    index = faiss.read_index(
        "ml/vector_search/repository.faiss"
    )

    with open(
        "ml/vector_search/repository_chunks.json",
        "r",
        encoding="utf-8"
    ) as f:

        chunks = json.load(f)

    with open(
        "ml/vector_search/repository_metadata.json",
        "r",
        encoding="utf-8"
    ) as f:

        metadata = json.load(f)

    query_embedding = model.encode(
        [query]
    )

    distances, indices = index.search(
        query_embedding.astype("float32"),
        top_k
    )

    results = []

    for rank, idx in enumerate(
        indices[0]
    ):

        results.append({

            "contract":
            metadata[idx]["contract"],

            "distance":
            float(
                distances[0][rank]
            ),

            "chunk":
            chunks[idx]
        })

    return results