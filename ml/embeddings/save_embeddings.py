import json
import numpy as np

from ml.utils.chunk_text import (
    chunk_text
)

from ml.ocr.hybrid_extractor import (
    extract_contract_text
)

from ml.embeddings.embed_contract import (
    generate_embeddings
)

pdf_path = (
    r"ml/data/raw/CUAD_v1/full_contract_pdf/"
    r"Part_I/Affiliate_Agreements/"
    r"CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"
)

print("Extracting text...")

text = extract_contract_text(
    pdf_path
)

print("Creating chunks...")

chunks = chunk_text(
    text
)

print("Generating embeddings...")

embeddings = generate_embeddings(
    chunks
)

print("Saving embeddings...")

np.save(
    "ml/embeddings/sample_embeddings.npy",
    embeddings
)

print("Saving chunks...")

with open(
    "ml/embeddings/sample_chunks.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        chunks,
        f,
        indent=4,
        ensure_ascii=False
    )

print("Saving metadata...")

metadata = {

    "filename":
    pdf_path.split("\\")[-1],

    "num_chunks":
    len(chunks),

    "embedding_dimension":
    embeddings.shape[1]
}

with open(
    "ml/embeddings/sample_metadata.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metadata,
        f,
        indent=4
    )

print("Saved Successfully")

print(
    f"Chunks: {len(chunks)}"
)

print(
    f"Embedding Shape: {embeddings.shape}"
)