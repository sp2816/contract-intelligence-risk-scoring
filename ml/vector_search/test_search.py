from ml.vector_search.semantic_search import (
    search_contract
)

results = search_contract(
    "termination clause"
)

print(
    "\nSearch Results\n"
)

for i, result in enumerate(
    results,
    start=1
):

    print(
        f"\nResult {i}\n"
    )

    print(
        "Distance:",
        result["distance"]
    )

    print()

    print(
        result["chunk"][:500]
    )

    print(
        "\n" + "-" * 60
    )