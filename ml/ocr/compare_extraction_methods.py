import time

from extract_text import extract_text_from_pdf
from ocr_scanned_pdf import ocr_pdf

pdf_path = r"D:\INTERNSHIP_ZAALIMA\contract-intelligence-risk-scoring\ml\data\raw\CUAD_v1\full_contract_pdf\Part_I\Affiliate_Agreements\CybergyHoldingsInc_20140520_10-Q_EX-10.27_8605784_EX-10.27_Affiliate Agreement.pdf"

# PDFPlumber Test
start = time.time()

pdf_text = extract_text_from_pdf(pdf_path)

pdf_time = time.time() - start

# OCR Test
start = time.time()

ocr_text = ocr_pdf(pdf_path)

ocr_time = time.time() - start

print("\n===== RESULTS =====")

print(f"\npdfplumber:")
print(f"Characters: {len(pdf_text)}")
print(f"Time: {pdf_time:.2f} seconds")

print(f"\nOCR:")
print(f"Characters: {len(ocr_text)}")
print(f"Time: {ocr_time:.2f} seconds")