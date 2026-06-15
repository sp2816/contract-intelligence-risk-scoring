from collections import Counter

from ml.ocr.hybrid_extractor import extract_contract_text
from ml.ner.entity_extractor import extract_entities

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"

# Extract text
text = extract_contract_text(pdf_path)

# Extract entities
entities = extract_entities(text)

# Count entity labels
counter = Counter(
    entity["label"]
    for entity in entities
)

print("Entity Statistics:")
print(counter)