from ml.utils.text_cleaner import clean_text
from ml.utils.chunker import chunk_text


def preprocess_contract(text):

    cleaned = clean_text(text)

    chunks = chunk_text(cleaned)

    return {
        "cleaned_text": cleaned,
        "chunks": chunks
    }