# AI-Powered Contract Intelligence & Risk Scoring Platform

An AI-powered legal document analysis platform that automates contract understanding, clause extraction, metadata identification, risk assessment, and intelligent question answering using Natural Language Processing (NLP), Machine Learning, and Retrieval-Augmented Generation (RAG).

The platform enables users to upload contracts, perform automated AI analysis, generate risk reports, and interact with all uploaded contracts through an intelligent chatbot.

---

## Features

### 📄 Contract Management
- Secure user authentication using JWT
- Upload PDF contracts
- View and manage uploaded contracts
- Store contract history

### 🤖 AI Contract Analysis
- Automatic PDF text extraction
- OCR support for scanned documents
- Named Entity Recognition (NER)
- Metadata extraction
  - Contracting parties
  - Effective date
  - Governing law
- Clause extraction and classification
- AI-generated contract summaries

### ⚠️ Risk Assessment
- Automated contract risk scoring
- Risk categorization
  - Low Risk
  - Medium Risk
  - High Risk
- Clause-level risk identification
- Risk report generation

### 💬 AI Legal Chatbot
- Ask questions across all uploaded contracts
- Retrieval-Augmented Generation (RAG)
- Semantic search using FAISS
- Database-aware chatbot for contract statistics
- Natural language contract queries

Example questions:
- Which contract has the highest risk score?
- Show recent contracts.
- What is the average risk score?
- Explain the termination clause.
- Summarize the confidentiality obligations.

### 📊 Dashboard & Analytics
- Total uploaded contracts
- Average risk score
- High / Medium / Low risk distribution
- Recent contract activity
- Interactive analytics dashboard

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-CORS

### AI / Machine Learning
- spaCy
- Hugging Face Transformers
- Sentence Transformers
- FAISS
- pdfplumber
- pytesseract
- pdf2image

### Database
- SQLite

---

## Project Structure

```
contract-intelligence-risk-scoring/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── instance/
│   │   └── main.py
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   └── hooks/
│
├── ml/
│   ├── pipeline/
│   ├── rag/
│   ├── vector_search/
│   ├── risk_scoring/
│   ├── clause_extraction/
│   └── utils/
│
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/contract-intelligence-risk-scoring.git

cd contract-intelligence-risk-scoring
```

---

### 2. Backend Setup

Navigate to the backend directory.

```bash
cd backend
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

Install the required dependencies.

```bash
pip install -r requirements.txt
```

Start the Flask server.

```bash
python app/main.py
```

Backend will run at:

```
http://localhost:5000
```

---

### 3. Frontend Setup

Open a new terminal.

```bash
cd frontend
```

Install dependencies.

```bash
npm install
```

Start the React application.

```bash
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## Application Workflow

1. Register or log in.
2. Upload a PDF contract.
3. AI extracts and cleans the contract text.
4. Metadata and entities are identified.
5. Clauses are extracted and classified.
6. Risk score and contract summary are generated.
7. Results are stored in the database.
8. Ask questions through the AI chatbot.
9. View contract analytics and reports.

---

## Future Enhancements

- DOCX contract support
- Multi-contract comparison
- Advanced clause recommendations
- Cloud deployment (AWS/Azure)
- Docker support
- PostgreSQL integration
- Multi-language contract analysis
- LLM-powered legal drafting assistant

---

## Contributors

Developed as part of an AI-powered legal contract intelligence project using modern NLP, Machine Learning, and Retrieval-Augmented Generation (RAG) techniques.