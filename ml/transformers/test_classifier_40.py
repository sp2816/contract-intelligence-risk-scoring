from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="ml/transformers/models/clause_classifier_40"
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

    print("\nText:")
    print(text)

    print("Prediction:")
    print(result["label"])

    print(
        "Confidence:",
        round(
            result["score"] * 100,
            2
        ),
        "%"
    )