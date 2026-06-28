from ml.transformers.confidence_classifier_40 import (
    classify_clause
)


def detect_clauses(chunks):

    results = []

    for chunk in chunks:

        prediction = classify_clause(
            chunk
        )

        results.append({
            "prediction": prediction["prediction"],
            "confidence": prediction["confidence"],
            "text": chunk
        })

    return results