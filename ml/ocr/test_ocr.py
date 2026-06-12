from ml.ocr.ocr_scanned_pdf import ocr_pdf

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"

text = ocr_pdf(pdf_path)

with open(
    r"ml/ocr/extracted_text/ocr_output.txt",
    "w",
    encoding="utf-8"
) as f:
    f.write(text)

print("Saved")