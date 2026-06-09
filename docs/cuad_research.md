# CUAD Dataset Research

## Dataset Name

Contract Understanding Atticus Dataset (CUAD) v1

---

## Overview

CUAD is a legal contract dataset containing more than 13,000 annotations across 510 commercial legal contracts.

The dataset was created by The Atticus Project to support NLP research and development for legal contract review.

The goal is to automatically identify and extract important legal clauses from contracts.

---

## Dataset Contents

CUAD contains:

* 510 Contract PDFs
* 510 Contract TXT Files
* 1 Master Clauses CSV
* 1 SQuAD-style JSON File
* 28 Excel Files containing categorized clauses

---

## Dataset Formats

### Master Clauses CSV

Contains:

* Contract Name
* Clause Text
* Human-Labeled Answers

Recommended starting point for model training.

### SQuAD-style JSON

Follows the same format as SQuAD 2.0.

Useful for:

* Question Answering
* Transformer Fine-tuning
* Legal BERT Models

### Contract PDFs

Raw contract documents.

Useful for OCR testing.

### Contract TXT Files

Plain text versions of contracts.

Useful for NLP preprocessing.

---

## Project Goal

Input:

* Unlabeled Contract PDF

Output:

* Extracted Clauses
* Contract Metadata
* Legal Entities
* Risk Indicators
* Contract Summary
* Chatbot Responses

---

## Important Categories For This Project

Instead of training all 41 categories initially, the project will focus on:

### Core Entity Extraction

* Parties
* Agreement Date
* Effective Date
* Expiration Date

### Clause Detection

* Termination
* Confidentiality
* Liability
* Auto Renewal

### Additional Metadata

* Governing Law
* Renewal Term
* Notice to Terminate Renewal

---

## Example Outputs

### Parties

Answer Format:

* Entity Names

Example:

* Microsoft Corporation
* ABC Technologies

### Effective Date

Answer Format:

* MM/DD/YYYY

Example:

* 05/08/2014

### Expiration Date

Answer Format:

* MM/DD/YYYY
* Perpetual

### Renewal Term

Answer Format:

* Number of Years
* Number of Months
* Perpetual

---

## Planned ML Pipeline

PDF Upload
→ OCR
→ Text Cleaning
→ Chunking
→ NER
→ Clause Classification
→ Risk Scoring
→ Embedding Generation
→ FAISS Vector Database
→ RAG Chatbot

---

## Technologies Used

### OCR

* pdfplumber
* PyPDF2
* Tesseract OCR
* pdf2image

### NLP

* spaCy
* Legal-BERT
* RoBERTa
* Hugging Face Transformers

### RAG

* Sentence Transformers
* FAISS
* LangChain

### Database

* PostgreSQL
* SQLAlchemy

---

## Notes

* Start with the Master Clauses CSV.
* Use the SQuAD JSON format for transformer-based experiments.
* Focus on a small subset of high-value legal clauses before expanding to all 41 categories.
* Use the contract PDFs for OCR testing and end-to-end pipeline validation.
