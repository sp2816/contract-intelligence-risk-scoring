import pandas as pd
import json
import os

INPUT_FILE = r"ml/data/raw/CUAD_v1/master_clauses.csv"

OUTPUT_DIR = r"ml/data/processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_CLAUSES = [
    "Termination For Convenience",
    "Renewal Term",
    "Notice Period To Terminate Renewal",
    "Governing Law",
    "Cap On Liability"
]

df = pd.read_csv(INPUT_FILE)

for clause in TARGET_CLAUSES:

    records = []

    for _, row in df.iterrows():

        clause_text = row.get(clause)

        if (
            pd.notna(clause_text)
            and str(clause_text).strip() != "[]"
        ):

            records.append({
                "contract": row["Filename"],
                "text": str(clause_text).strip('[]').replace('"', '')
            })

    output_file = os.path.join(
        OUTPUT_DIR,
        clause.lower()
              .replace(" ", "_")
              .replace("/", "_")
              + ".json"
    )

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=4)

    print(f"{clause}: {len(records)} records")