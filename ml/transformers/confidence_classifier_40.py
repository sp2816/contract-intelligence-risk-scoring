from transformers import pipeline

import os

MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "models",
        "clause_classifier_40"
    )
)

classifier = pipeline(
    "text-classification",
    model=MODEL_PATH
)

THRESHOLD = 0.70


def classify_clause(text):

    result = classifier(

        text,

        truncation=True,

        max_length=512
    )[0]

    confidence = result["score"]

    if confidence < THRESHOLD:

        return {

            "prediction": "UNCERTAIN",

            "confidence": confidence
        }

    return {

        "prediction": result["label"],

        "confidence": confidence
    }