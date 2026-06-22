import pandas as pd

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

for clause in TARGET_CLAUSES:

    count = (
        (df[clause].notna()) &
        (df[clause] != "[]")
    ).sum()

    print(f"{clause}: {count}")