import pandas as pd

df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)

columns = df.columns.tolist()

for column in columns:

    if "-Answer" not in column and column != "Filename":

        print(column)