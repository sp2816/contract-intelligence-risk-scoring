import pandas as pd

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

dates = df[
    [
        "Filename",
        "Agreement Date-Answer",
        "Effective Date-Answer",
        "Expiration Date-Answer"
    ]
]

print(dates.head())