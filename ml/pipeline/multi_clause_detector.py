from ml.transformers.confidence_classifier import (
    classify_clause
)


def detect_clauses(chunks):

    results = []

    for chunk in chunks:

        prediction = classify_clause(
            chunk
        )

        results.append(
            prediction
        )

    return results