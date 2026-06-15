import pandas as pd

# Load CUAD dataset
df = pd.read_csv(
    r"ml/data/raw/CUAD_v1/master_clauses.csv"
)


def clean_value(value):
    """
    Convert NaN values to None
    for JSON compatibility.
    """
    if pd.isna(value):
        return None

    return value


def get_contract_metadata(filename):
    """
    Extract key contract metadata
    from the CUAD dataset.
    """

    contract = df[
        df["Filename"] == filename
    ]

    if len(contract) == 0:
        return None

    row = contract.iloc[0]

    return {

        "filename":
        clean_value(row["Filename"]),

        "parties":
        clean_value(row["Parties-Answer"]),

        "agreement_date":
        clean_value(row["Agreement Date-Answer"]),

        "effective_date":
        clean_value(row["Effective Date-Answer"]),

        "expiration_date":
        clean_value(row["Expiration Date-Answer"]),

        "governing_law":
        clean_value(row["Governing Law-Answer"])
    }