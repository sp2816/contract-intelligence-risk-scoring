import pandas as pd

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

columns_of_interest = [
    "Parties-Answer",
    "Agreement Date-Answer",
    "Effective Date-Answer",
    "Expiration Date-Answer",
    "Governing Law-Answer"
]

for col in columns_of_interest:

    print("\n", col)

    print(df[col].dropna().head())