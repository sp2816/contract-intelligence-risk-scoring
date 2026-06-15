import os
from ml.ocr.extract_text import extract_text_from_pdf

PDF_FOLDER = r"ml/data/raw/CUAD_v1/full_contract_pdf"
OUTPUT_FOLDER = r"ml/ocr/extracted_text"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

processed = 0

for root, dirs, files in os.walk(PDF_FOLDER):

    for file in files:

        if file.lower().endswith(".pdf"):

            pdf_path = os.path.join(root, file)

            try:

                text = extract_text_from_pdf(pdf_path)

                output_file = os.path.join(
                    OUTPUT_FOLDER,
                    file.replace(".pdf", ".txt")
                )

                with open(
                    output_file,
                    "w",
                    encoding="utf-8"
                ) as f:
                    f.write(text)

                processed += 1

                print(f"Processed: {file}")

                if processed >= 10:
                    break

            except Exception as e:
                print(f"Failed: {file}")

    if processed >= 10:
        break

print(f"\nTotal PDFs Processed: {processed}")