from ml.utils.chunk_text import chunk_text
from ml.pipeline.multi_clause_detector_40 import detect_clauses
from ml.risk_scoring.risk_analyzer import (
    calculate_risk_score,
    risk_level
)
from ml.ocr.hybrid_extractor import extract_contract_text
from ml.utils.text_cleaner import clean_text
from ml.ner.contract_entities import extract_entities
from ml.utils.metadata_extractor import (
    extract_contract_metadata
)

import time


def analyze_contract(pdf_path):

    total_start = time.time()

    print("Extracting text...")

    t = time.time()

    text = extract_contract_text(pdf_path)

    print(f"OCR Time: {time.time() - t:.2f}s")


    print("Cleaning text...")

    t = time.time()

    cleaned_text = clean_text(text)

    print(f"Cleaning Time: {time.time() - t:.2f}s")


    print("Running NER...")

    t = time.time()

    entities = extract_entities(cleaned_text)
    metadata = extract_contract_metadata(entities, cleaned_text)

    print(f"NER Time: {time.time() - t:.2f}s")


    print("Splitting into chunks...")

    t = time.time()

    chunks = chunk_text(cleaned_text)

    chunks = chunks[:30]

    print(f"Chunking Time: {time.time() - t:.2f}s")
    print(f"Total Chunks: {len(chunks)}")


    print("Running Multi-Clause Detection...")

    t = time.time()

    clause_results = detect_clauses(chunks)

    print(f"Clause Detection Time: {time.time() - t:.2f}s")


    print("Calculating Risk Score...")

    t = time.time()

    score, reasons = calculate_risk_score(clause_results)

    level = risk_level(score)

    reasons.insert(
        0,
        f"Contract classified as {level} risk with score {score}"
    )

    if metadata.get("governing_law"):
        reasons.append(
            f"Governing law identified as {metadata['governing_law']}"
        )

    if metadata.get("parties"):
        reasons.append(
            f"{len(metadata['parties'])} contracting parties identified"
        )

    print(f"Risk Scoring Time: {time.time() - t:.2f}s")

    print(f"TOTAL PIPELINE TIME: {time.time() - total_start:.2f}s")

    print("\n===== FINAL SCORE =====")
    print(score)
    print(level)
    print("\n===== ENTITIES =====")
    print(entities)
    print("\n===== METADATA =====")
    print(metadata)
    return {
        "risk_score": score,
        "risk_level": level,
        "risk_reasons": reasons,
        "clause_predictions": clause_results,
        "entities": entities,
        "metadata": metadata
    }