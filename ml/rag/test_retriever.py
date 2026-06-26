from ml.rag.retriever import (
    retrieve_context
)

results = retrieve_context(
    "termination clause"
)

for i, chunk in enumerate(
    results,
    start=1
):

    print(
        f"\nChunk {i}\n"
    )

    print(
        chunk[:500]
    )