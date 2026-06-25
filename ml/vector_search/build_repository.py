import json
import numpy as np
import faiss
import os

from ml.embeddings.embed_contract import (
    generate_embeddings
)

from ml.utils.chunk_text import (
    chunk_text
)

from ml.ocr.hybrid_extractor import (
    extract_contract_text
)

pdf_files = [

    r"ml/data/raw/CUAD_v1/full_contract_pdf/Part_I/Affiliate_Agreements/CreditcardscomInc_20070810_S-1_EX-10.33_362297_EX-10.33_Affiliate Agreement.pdf",

    r"ml/data/raw/CUAD_v1/full_contract_pdf/Part_I/Affiliate_Agreements/CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf",

    r"ml/data/raw/CUAD_v1/full_contract_pdf/Part_I/Affiliate_Agreements/DigitalCinemaDestinationsCorp_20111220_S-1_EX-10.10_7346719_EX-10.10_Affiliate Agreement.pdf"
]

all_chunks = []

metadata = []

for pdf_path in pdf_files:

    print(
        "Processing:",
        pdf_path.split("\\")[-1]
    )

    text = extract_contract_text(
        pdf_path
    )

    chunks = chunk_text(
        text
    )

    for chunk in chunks:

        all_chunks.append(
            chunk
        )

        metadata.append({

            "contract":
            os.path.basename(pdf_path)
        })

print(
    "Generating embeddings..."
)

embeddings = generate_embeddings(
    all_chunks
)

np.save(
    "ml/vector_search/repository_embeddings.npy",
    embeddings
)

with open(
    "ml/vector_search/repository_chunks.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        all_chunks,
        f,
        indent=4
    )

with open(
    "ml/vector_search/repository_metadata.json",
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        metadata,
        f,
        indent=4
    )

index = faiss.IndexFlatL2(
    embeddings.shape[1]
)

index.add(
    embeddings.astype("float32")
)

faiss.write_index(
    index,
    "ml/vector_search/repository.faiss"
)

print(
    "Repository Built Successfully"
)

print(
    "Total Chunks:",
    len(all_chunks)
)