from ml.vector_search.repository_search import (
    search_repository
)

results = search_repository(
    "termination clause"
)

for i, result in enumerate(
    results,
    start=1
):

    print(
        f"\nResult {i}"
    )

    print(
        "Contract:",
        result["contract"]
    )

    print(
        "Distance:",
        result["distance"]
    )

    print()

    print(
        result["chunk"][:300]
    )