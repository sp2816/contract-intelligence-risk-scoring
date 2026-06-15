from ml.ocr.extract_text import extract_text_from_pdf
from ml.ocr.ocr_scanned_pdf import ocr_pdf

MIN_TEXT_LENGTH = 100


def extract_contract_text(pdf_path):
    """
    Hybrid extraction strategy:
    1. Try pdfplumber extraction first
    2. If very little text is extracted, use OCR
    """

    text = extract_text_from_pdf(pdf_path)

    if len(text.strip()) < MIN_TEXT_LENGTH:
        print("No text detected. Switching to OCR...")
        text = ocr_pdf(pdf_path)
    else:
        print("Using pdfplumber extraction")

    return text