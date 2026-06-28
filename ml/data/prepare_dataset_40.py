import pandas as pd
import json

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

dataset = []

all_clauses = []

for col in df.columns:

    if col == "Filename":
        continue

    if col == "Document Name":
        continue

    if "Answer" in col:
        continue

    all_clauses.append(col)

print(all_clauses)

print(
    "Clause Labels:",
    len(all_clauses)
)

for clause in all_clauses:

    for _, row in df.iterrows():

        text = row.get(
            clause
        )

        if (
            pd.notna(text)
            and str(text).strip() != ""
            and text != "[]"
        ):

            dataset.append({

                "label": clause,

                "text": str(text)
            })

labels = {

    item["label"]

    for item in dataset
}

print(
    "Records:",
    len(dataset)
)

print(
    "Labels:",
    len(labels)
)

with open(

    "ml/data/processed/clause_dataset_40.json",

    "w",

    encoding="utf-8"
) as f:

    json.dump(

        dataset,

        f,

        indent=4
    )

print(
    "\nDataset saved to ml/data/processed/clause_dataset_40.json"
)