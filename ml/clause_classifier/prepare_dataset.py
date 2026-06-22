import pandas as pd
import json

TARGET_CLAUSES = [

    "Termination For Convenience",

    "Governing Law",

    "License Grant",

    "Exclusivity",

    "Change Of Control"
]

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

dataset = []

for clause in TARGET_CLAUSES:

    for _, row in df.iterrows():

        text = row.get(clause)

        if pd.notna(text) and text != "[]":

            dataset.append({

                "label": clause,

                "text": text
            })

print("Records:", len(dataset))

with open(
    "ml/clause_classifier/sample_dataset.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        dataset,
        f,
        indent=4
    )