-- ==========================================
-- CONTRACT INTELLIGENCE & RISK SCORING
-- PostgreSQL Schema
-- ==========================================

-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CONTRACTS
-- ==========================================

CREATE TABLE contracts (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255),

    file_path TEXT,

    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(50) DEFAULT 'uploaded',

    total_pages INTEGER,

    extracted_text TEXT,

    contract_summary TEXT
);

-- ==========================================
-- ENTITIES (NER OUTPUT)
-- ==========================================

CREATE TABLE entities (
    id SERIAL PRIMARY KEY,

    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,

    entity_type VARCHAR(100) NOT NULL,

    entity_value TEXT NOT NULL,

    confidence_score FLOAT,

    page_number INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CLAUSES
-- ==========================================

CREATE TABLE clauses (
    id SERIAL PRIMARY KEY,

    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,

    clause_type VARCHAR(255) NOT NULL,

    clause_text TEXT NOT NULL,

    confidence_score FLOAT,

    risk_level VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- RISK REPORTS
-- ==========================================

CREATE TABLE risk_reports (
    id SERIAL PRIMARY KEY,

    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,

    overall_risk_score INTEGER,

    risk_summary TEXT,

    high_risk_clauses INTEGER DEFAULT 0,

    medium_risk_clauses INTEGER DEFAULT 0,

    low_risk_clauses INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- EMBEDDING METADATA
-- (FAISS VECTOR REFERENCES)
-- ==========================================

CREATE TABLE embedding_metadata (
    id SERIAL PRIMARY KEY,

    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,

    chunk_index INTEGER,

    chunk_text TEXT,

    vector_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CHAT SESSIONS
-- ==========================================

CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,

    session_title VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CHAT MESSAGES
-- ==========================================

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,

    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,

    sender VARCHAR(20) NOT NULL,

    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_contracts_user
ON contracts(user_id);

CREATE INDEX idx_entities_contract
ON entities(contract_id);

CREATE INDEX idx_clauses_contract
ON clauses(contract_id);

CREATE INDEX idx_risk_contract
ON risk_reports(contract_id);

CREATE INDEX idx_chat_session
ON chat_messages(session_id);