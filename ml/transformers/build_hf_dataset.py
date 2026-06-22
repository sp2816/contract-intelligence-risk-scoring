import json
import ast

from ml.transformers.label_mapping import LABELS


INPUT_FILE = (
    "ml/clause_classifier/sample_dataset.json"
)

OUTPUT_FILE = (
    "ml/data/processed/clause_dataset.json"
)


with open(
    INPUT_FILE,
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)


processed = []

for item in data:

    text = item["text"]

    try:
        clauses = ast.literal_eval(text)

        if isinstance(clauses, list):
            text = " ".join(
                str(x)
                for x in clauses
            )

    except:
        pass

    processed.append({
        "text": text,
        "label": LABELS[item["label"]]
    })


with open(
    OUTPUT_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        processed,
        f,
        indent=4
    )


print(
    "Saved:",
    len(processed),
    "records"
)