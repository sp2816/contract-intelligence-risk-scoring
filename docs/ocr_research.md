# OCR Research

## Objective

The OCR pipeline will extract text from uploaded contract PDFs before NLP processing.

The extracted text will be used for:

* Named Entity Recognition (NER)
* Clause Classification
* Risk Scoring
* Embedding Generation
* RAG Chatbot

---

## OCR Workflow

Contract PDF
→ PDF Parsing
→ OCR (if required)
→ Text Cleaning
→ Chunking
→ NLP Pipeline

---

## Libraries Evaluated

### pdfplumber

Purpose:

* Extract text directly from digital PDFs.

Advantages:

* Fast
* Accurate for text-based PDFs
* Preserves formatting better than many alternatives

Use Case:

* Primary extraction method for searchable PDFs.

Example:

```python
import pdfplumber

with pdfplumber.open("contract.pdf") as pdf:
    text = ""
    for page in pdf.pages:
        text += page.extract_text()
```

---

### PyPDF2

Purpose:

* Read PDF files and extract basic text.

Advantages:

* Lightweight
* Simple API

Limitations:

* Struggles with complex layouts

Use Case:

* Backup extraction method.

---

### Tesseract OCR

Purpose:

* Extract text from scanned PDF documents and images.

Advantages:

* Open-source
* Widely used OCR engine

Limitations:

* Slower than direct text extraction
* Accuracy depends on scan quality

Use Case:

* When PDF contains scanned pages instead of selectable text.

---

### pdf2image

Purpose:

* Convert PDF pages into images.

Advantages:

* Works well with Tesseract OCR

Use Case:

* Preprocessing step for scanned PDFs.

Workflow:

PDF
→ pdf2image
→ Images
→ Tesseract OCR
→ Extracted Text

---

## Planned OCR Strategy

### Step 1

Try direct text extraction using:

* pdfplumber

### Step 2

If no text is found:

* Convert pages to images using pdf2image

### Step 3

Run:

* Tesseract OCR

### Step 4

Clean extracted text before NLP processing.

---

## Expected Output

Input:

* Contract PDF

Output:

```json
{
  "contract_name": "sample_contract.pdf",
  "text": "Full extracted contract text..."
}
```

---

## Tools Selected For Project

Primary:

* pdfplumber

Fallback:

* pdf2image + Tesseract OCR

Supporting:

* PyPDF2
