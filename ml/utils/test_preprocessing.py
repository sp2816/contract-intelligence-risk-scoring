from ml.ocr.hybrid_extractor import extract_contract_text

from ml.utils.text_cleaner import clean_text
from ml.utils.sentence_splitter import split_sentences
from ml.utils.chunker import chunk_text

import json

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"

text = extract_contract_text(pdf_path)

cleaned = clean_text(text)

sentences = split_sentences(cleaned)

# Create chunks first
chunks = chunk_text(cleaned)

print("Characters:", len(cleaned))
print("Sentences:", len(sentences))
print("Chunks:", len(chunks))

print("\nFirst Sentence:\n")
print(sentences[0])

print("\nFirst Chunk Preview:\n")
print(chunks[0][:500])

# Save chunks
with open(
    "ml/data/chunks/sample_chunks.json",
    "w",
    encoding="utf-8"
) as f:
    json.dump(chunks, f, indent=4)