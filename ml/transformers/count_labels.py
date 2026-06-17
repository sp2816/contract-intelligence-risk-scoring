import json
from collections import Counter

with open(
    "ml/data/processed/clause_dataset.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

counter = Counter(
    item["label"]
    for item in data
)

print(counter)