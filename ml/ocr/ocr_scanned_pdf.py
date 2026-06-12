from pdf2image import convert_from_path
import pytesseract

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

def ocr_pdf(pdf_path):

    images = convert_from_path(
        pdf_path,
        poppler_path=r"C:\poppler\poppler-26.02.0\Library\bin"
    )

    text = ""

    for image in images:

        page_text = pytesseract.image_to_string(image)

        text += page_text + "\n"

    return text