from ml.ocr.hybrid_extractor import extract_contract_text

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"

text = extract_contract_text(pdf_path)

print(text[:1000])
print("\nCharacters:", len(text))