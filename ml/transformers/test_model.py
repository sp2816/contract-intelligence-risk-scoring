from transformers import pipeline

from ml.transformers.label_mapping import (
    ID_TO_LABEL
)

classifier = pipeline(
    "text-classification",
    model="ml/transformers/models/clause_classifier"
)

texts = [

    "This Agreement shall be governed by the laws of Nevada.",

    "Either party may terminate this Agreement upon sixty days written notice.",

    "The Company grants Licensee a non-exclusive license to use the Software.",

    "Distributor shall be the exclusive reseller within the territory.",

    "A change in control shall mean a merger or acquisition of the Company."
]

for text in texts:

    result = classifier(text)[0]

    label_id = int(
        result["label"].split("_")[1]
    )

    prediction = ID_TO_LABEL[label_id]

    confidence = round(
        result["score"] * 100,
        2
    )

    print("\nText:")
    print(text)

    print("Prediction:", prediction)

    print("Confidence:", confidence, "%")