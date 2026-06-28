import pandas as pd

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

for col in df.columns:

    print(col)