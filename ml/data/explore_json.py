import json

with open(
    r"ml/data/raw/CUAD_v1/CUAD_v1.json",
    "r",
    encoding="utf-8"
) as f:
    data = json.load(f)

print("Top-level keys:")
print(data.keys())

print("\nNumber of contracts:")
print(len(data["data"]))