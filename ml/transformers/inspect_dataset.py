import json

with open(
    "ml/data/processed/clause_dataset.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

print(
    "Total Records:",
    len(data)
)

print(
    "\nFirst Record:\n"
)

print(
    data[0]
)