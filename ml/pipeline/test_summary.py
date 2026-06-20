from ml.pipeline.summary_generator import (
    generate_summary
)

sample = {

    "characters": 28000,

    "entity_count": 450,

    "clause_prediction": {

        "prediction":
        "License Grant",

        "confidence":
        0.91
    }
}

print(
    generate_summary(sample)
)