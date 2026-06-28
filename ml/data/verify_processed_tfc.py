import json

with open(
    r"ml/data/processed/termination_for_convenience.json",
    "r",
    encoding="utf-8"
) as f:

    data = json.load(f)

print("Total:", len(data))

print("\nFirst Record:")
print(data[0])