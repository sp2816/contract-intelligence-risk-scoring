import os
import json
import sqlite3
from datetime import datetime
# pyrefly: ignore [missing-import]
from werkzeug.security import generate_password_hash

# Path to the database
DB_DIR = os.path.join(os.path.dirname(__file__), 'app', 'instance')
DB_PATH = os.path.join(DB_DIR, 'lexai.db')

# Ensure directory exists
if not os.path.exists(DB_DIR):
    os.makedirs(DB_DIR)

print(f"Initializing SQLite database at: {DB_PATH}")

# SQL Schema commands adapted for SQLite
SQL_SCHEMA = """
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_sessions;
DROP TABLE IF EXISTS embedding_metadata;
DROP TABLE IF EXISTS risk_reports;
DROP TABLE IF EXISTS clauses;
DROP TABLE IF EXISTS entities;
DROP TABLE IF EXISTS contracts;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferences TEXT,
    oauth_id VARCHAR(255) UNIQUE,
    oauth_provider VARCHAR(50),
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts Table
CREATE TABLE contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

-- Entities Table
CREATE TABLE entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL,
    entity_value TEXT NOT NULL,
    confidence_score FLOAT,
    page_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clauses Table
CREATE TABLE clauses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    clause_type VARCHAR(255) NOT NULL,
    clause_text TEXT NOT NULL,
    confidence_score FLOAT,
    risk_level VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk Reports Table
CREATE TABLE risk_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    overall_risk_score INTEGER,
    risk_summary TEXT,
    high_risk_clauses INTEGER DEFAULT 0,
    medium_risk_clauses INTEGER DEFAULT 0,
    low_risk_clauses INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Embedding Metadata Table
CREATE TABLE embedding_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    chunk_index INTEGER,
    chunk_text TEXT,
    vector_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Sessions Table
CREATE TABLE chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    session_title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contracts_user ON contracts(user_id);
CREATE INDEX idx_entities_contract ON entities(contract_id);
CREATE INDEX idx_clauses_contract ON clauses(contract_id);
CREATE INDEX idx_risk_contract ON risk_reports(contract_id);
CREATE INDEX idx_chat_session ON chat_messages(session_id);
"""

# Sample text blocks for clauses
LOL_TEXT = '"In no event shall Provider be liable for any indirect, incidental, special or consequential damages. Provider\'s total aggregate liability under this agreement shall be capped at the total amount paid by Client in the preceding three (3) months."'
INDEMNITY_TEXT = '"Client shall indemnify and defend Provider against any third-party claims, losses, or liabilities arising out of Client\'s use of the SaaS application, except to the extent caused by Provider\'s gross negligence."'
TERM_TEXT = '"Provider may terminate this agreement at any time for convenience upon thirty (30) days\' written notice to Client. Client may only terminate in the event of an uncured material breach by Provider."'
IP_TEXT = '"Provider retains all right, title, and interest in and to the SaaS application, documentation, and any system metadata. Client retains all rights in client-loaded data."'

def seed_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create tables
    print("Executing schema to create tables...")
    cursor.executescript(SQL_SCHEMA)

    print("Seeding database with actual records...")

    # 1. Seed Users
    # We will seed demo@lexai-intel.com and admin@lexai-intel.com
    demo_pw = generate_password_hash("password123")
    admin_pw = generate_password_hash("adminsecure")

    default_prefs = json.dumps({
        "theme": "dark",
        "notifications": True,
        "defaultView": "dashboard"
    })

    cursor.execute(
        "INSERT INTO users (fullname, email, password_hash, preferences) VALUES (?, ?, ?, ?)",
        ("Demo Legal Counsel", "demo@lexai-intel.com", demo_pw, default_prefs)
    )
    user_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO users (fullname, email, password_hash, preferences) VALUES (?, ?, ?, ?)",
        ("Admin Legal Reviewer", "admin@lexai-intel.com", admin_pw, default_prefs)
    )

    testdev_pw = generate_password_hash("SECURE1234!")
    cursor.execute(
        "INSERT INTO users (fullname, email, password_hash, preferences) VALUES (?, ?, ?, ?)",
        ("Test Dev User", "testdev1@gmail.com", testdev_pw, default_prefs)
    )

    # 2. Seed Contracts
    cursor.execute(
        "INSERT INTO contracts (user_id, filename, original_filename, status, total_pages, contract_summary) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, 'SaaS_Service_Agreement_Acme.pdf', 'SaaS_Service_Agreement_Acme.pdf', 'Reviewed', 12, 
         'The SaaS agreement for Acme Corp is high risk with unilateral termination and low liability caps.')
    )
    contract_1_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO contracts (user_id, filename, original_filename, status, total_pages, contract_summary) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, 'NDA_Tech_Ventures.pdf', 'NDA_Tech_Ventures.pdf', 'Approved', 3, 
         'Standard NDA for Tech Ventures with mutual obligations and 3 years survival.')
    )
    contract_2_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO contracts (user_id, filename, original_filename, status, total_pages, contract_summary) VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, 'License_Agreement_DataFlow.pdf', 'License_Agreement_DataFlow.pdf', 'Pending', 8, 
         'Software license with DataFlow Ltd showing a high risk score due to IP warranty limitations.')
    )
    contract_3_id = cursor.lastrowid

    # 3. Seed Clauses for Contract 1 (Acme Agreement)
    clauses_data = [
        (contract_1_id, 'Limitation of Liability', LOL_TEXT, 0.85, 'high'),
        (contract_1_id, 'Indemnification Obligations', INDEMNITY_TEXT, 0.78, 'high'),
        (contract_1_id, 'Termination for Convenience', TERM_TEXT, 0.52, 'medium'),
        (contract_1_id, 'Intellectual Property Assignment', IP_TEXT, 0.18, 'low')
    ]
    cursor.executemany(
        "INSERT INTO clauses (contract_id, clause_type, clause_text, confidence_score, risk_level) VALUES (?, ?, ?, ?, ?)",
        clauses_data
    )

    # 4. Seed Risk Reports
    cursor.execute(
        "INSERT INTO risk_reports (contract_id, overall_risk_score, risk_summary, high_risk_clauses, medium_risk_clauses, low_risk_clauses) VALUES (?, ?, ?, ?, ?, ?)",
        (contract_1_id, 74, 
         'The agreement presents high risk due to broad limitation of liability exemptions favoring the Provider, unilateral termination clauses, and the total omission of a GDPR-compliant Data Protection Addendum (DPA) despite handling personal user data.',
         2, 1, 1)
    )
    cursor.execute(
        "INSERT INTO risk_reports (contract_id, overall_risk_score, risk_summary, high_risk_clauses, medium_risk_clauses, low_risk_clauses) VALUES (?, ?, ?, ?, ?, ?)",
        (contract_2_id, 15, 'Low risk mutual NDA with 3-year term.', 0, 0, 2)
    )
    cursor.execute(
        "INSERT INTO risk_reports (contract_id, overall_risk_score, risk_summary, high_risk_clauses, medium_risk_clauses, low_risk_clauses) VALUES (?, ?, ?, ?, ?, ?)",
        (contract_3_id, 62, 'Medium risk license agreement with DataFlow.', 1, 1, 1)
    )

    # 5. Seed Entities (NER Output)
    entities = [
        (contract_1_id, 'COMPANY', 'Acme Corp', 0.98, 1),
        (contract_1_id, 'COMPANY', 'DataCore Solutions Inc', 0.99, 1),
        (contract_1_id, 'DATE', 'October 15, 2024', 0.95, 1),
        (contract_1_id, 'JURISDICTION', 'State of Delaware', 0.92, 12)
    ]
    cursor.executemany(
        "INSERT INTO entities (contract_id, entity_type, entity_value, confidence_score, page_number) VALUES (?, ?, ?, ?, ?)",
        entities
    )

    # 6. Seed Chat Sessions & Messages
    cursor.execute(
        "INSERT INTO chat_sessions (user_id, contract_id, session_title) VALUES (?, ?, ?)",
        (user_id, contract_1_id, "NDA Review Guidelines")
    )
    session_1_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO chat_sessions (user_id, contract_id, session_title) VALUES (?, ?, ?)",
        (user_id, contract_1_id, "Boilerplate Liability Cap")
    )
    session_2_id = cursor.lastrowid

    # Messages for Session 1
    messages_1 = [
        (session_1_id, 'user', 'Can you analyze standard risk limits and exceptions for mutual Non-Disclosure Agreements (NDAs)? Outline high risk red flags to watch out for.'),
        (session_1_id, 'assistant', '### Mutual NDA Risk Analysis Report\n\nBased on standard enterprise legal benchmarks, here is an automated risk assessment for Mutual Non-Disclosure Agreements (NDAs):\n\n#### 1. High-Risk Red Flags (Must Redline)\n*   **Unilateral Obligations**: Ensure that confidentiality rules bind both parties equally.\n*   **Definition of Confidential Information**: Verbal disclosures should be covered if confirmed in writing within 30 days.\n*   **Survival Period**: Standard term is 2 to 5 years from disclosure.\n*   **Intellectual Property Rights**: NDAs should explicitly state no licenses are granted.')
    ]
    cursor.executemany(
        "INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)",
        messages_1
    )

    # Messages for Session 2
    messages_2 = [
        (session_2_id, 'user', 'Provide a boilerplate Limitation of Liability clause under Delaware law'),
        (session_2_id, 'assistant', '### Boilerplate Limitation of Liability (LoL) Drafting Guide\n\nIn commercial agreements, the Limitation of Liability is the most critical risk-transfer mechanism.\n\n```javascript\n/**\n * LIMITATION OF LIABILITY.\n * EXCEPT FOR CARVE-OUTS, NEITHER PARTY WILL BE LIABLE FOR CONSEQUENTIAL OR INDIRECT DAMAGES,\n * AND AGGREGATE LIABILITY SHALL BE CAPPED AT THE FEES PAID IN THE TRAILING 12 MONTHS.\n */\n```')
    ]
    cursor.executemany(
        "INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)",
        messages_2
    )

    conn.commit()
    conn.close()
    print("Database successfully initialized and seeded with actual data!")

if __name__ == '__main__':
    seed_database()
