from transformers import pipeline

from ml.transformers.label_mapping import (
    ID_TO_LABEL
)

classifier = pipeline(

    "text-classification",

    model="ml/transformers/models/clause_classifier"
)

THRESHOLD = 0.70


def classify_clause(text):

    result = classifier(
        text,
        truncation=True,
        max_length=512
    )[0]

    label_id = int(
        result["label"].split("_")[1]
    )

    confidence = result["score"]

    if confidence < THRESHOLD:

        return {

            "prediction": "UNCERTAIN",

            "confidence": confidence
        }

    return {

        "prediction": ID_TO_LABEL[label_id],

        "confidence": confidence
    }