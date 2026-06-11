from extract_text import extract_text_from_pdf

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CreditcardscomInc_20070810_S-1_EX-10.33_362297_EX-10.33_Affiliate Agreement.pdf"

text = extract_text_from_pdf(pdf_path)

with open(
    r"ml/ocr/extracted_text/sample_contract.txt",
    "w",
    encoding="utf-8"
) as f:
    f.write(text)

print("Text saved successfully")
print(f"Characters extracted: {len(text)}")