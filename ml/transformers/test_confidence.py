from ml.transformers.confidence_classifier import (
    classify_clause
)

text = (
    "This Agreement shall be governed "
    "by the laws of Nevada."
)

print(
    classify_clause(text)
)