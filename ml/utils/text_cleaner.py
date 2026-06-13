import re


def clean_text(text):
    """
    Clean extracted contract text.
    """

    # Remove extra spaces
    text = re.sub(r"\s+", " ", text)

    # Remove repeated newlines
    text = re.sub(r"\n+", "\n", text)

    # Remove tabs
    text = text.replace("\t", " ")

    return text.strip()