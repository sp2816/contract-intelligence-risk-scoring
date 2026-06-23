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

text = extract_contract_text(
    pdf_path
)

chunks = chunk_text(
    text
)

chunks = chunks[:5]

embeddings = generate_embeddings(
    chunks
)

print(
    "Chunks:",
    len(chunks)
)

print(
    "Embedding Shape:",
    embeddings.shape
)