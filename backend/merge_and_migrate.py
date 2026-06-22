import os
import sqlite3
import shutil

# Database paths
TARGET_DB = r"d:\INTERNSHIP\Project-2\contract-intelligence-risk-scoring\backend\app\instance\lexai.db"
SOURCES = {
    "backend_instance": r"d:\INTERNSHIP\Project-2\contract-intelligence-risk-scoring\backend\instance\lexai.db",
    "root_instance": r"d:\INTERNSHIP\Project-2\contract-intelligence-risk-scoring\instance\lexai.db"
}

def backup_database(db_path):
    if os.path.exists(db_path):
        backup_path = db_path + ".bak"
        shutil.copy2(db_path, backup_path)
        print(f"[OK] Backed up {db_path} to {backup_path}")
    else:
        print(f"[WARNING] Cannot backup, file does not exist: {db_path}")

def run_merge():
    print("--- STARTING DATABASE MERGE ---")
    
    # 1. Backup target
    backup_database(TARGET_DB)
    
    # Connect to target
    target_conn = sqlite3.connect(TARGET_DB)
    target_curr = target_conn.cursor()
    
    # Make sure target database is fully migrated first
    # 2. Add columns if missing in target
    target_curr.execute("PRAGMA table_info(contracts)")
    contract_cols = {row[1] for row in target_curr.fetchall()}
    if 'risk_score' not in contract_cols:
        print("[INFO] Adding `risk_score` column to target `contracts` table...")
        target_curr.execute("ALTER TABLE contracts ADD COLUMN risk_score REAL")
        
    target_curr.execute("PRAGMA table_info(users)")
    user_cols = {row[1] for row in target_curr.fetchall()}
    if 'reset_token' not in user_cols:
        print("[INFO] Adding `reset_token` column to target `users` table...")
        target_curr.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255)")
    if 'reset_token_expiry' not in user_cols:
        print("[INFO] Adding `reset_token_expiry` column to target `users` table...")
        target_curr.execute("ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP")
    target_conn.commit()

    # Load target users for mapping
    target_curr.execute("SELECT id, email FROM users")
    target_users = {email.strip().lower(): uid for uid, email in target_curr.fetchall()}
    
    # Load target contracts for mapping
    target_curr.execute("SELECT id, user_id, filename FROM contracts")
    target_contracts = {(user_id, filename): cid for cid, user_id, filename in target_curr.fetchall()}
    
    # Loop over sources
    for src_name, src_path in SOURCES.items():
        if not os.path.exists(src_path):
            print(f"[SKIP] Source database {src_name} does not exist at {src_path}")
            continue
            
        print(f"\nProcessing source: {src_name} ({src_path})")
        src_conn = sqlite3.connect(src_path)
        src_curr = src_conn.cursor()
        
        # User ID mappings for this source: old_id -> new_id
        user_id_map = {}
        
        # Fetch users from source
        src_curr.execute("SELECT id, fullname, email, password_hash, preferences, oauth_id, oauth_provider, is_active, created_at, updated_at FROM users")
        src_users = src_curr.fetchall()
        
        for u in src_users:
            old_uid, fullname, email, pwd_hash, prefs, oauth_id, oauth_prov, is_act, created, updated = u
            norm_email = email.strip().lower()
            
            if norm_email in target_users:
                # User already exists in target
                new_uid = target_users[norm_email]
                user_id_map[old_uid] = new_uid
                print(f"  User {email} already exists as ID {new_uid}")
            else:
                # Insert user into target
                target_curr.execute("""
                    INSERT INTO users (fullname, email, password_hash, preferences, oauth_id, oauth_provider, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (fullname, email, pwd_hash, prefs, oauth_id, oauth_prov, is_act, created, updated))
                new_uid = target_curr.lastrowid
                target_users[norm_email] = new_uid
                user_id_map[old_uid] = new_uid
                print(f"  Inserted user {email} as ID {new_uid}")
        
        # Contract ID mappings for this source: old_id -> new_id
        contract_id_map = {}
        
        # Check source contracts columns to handle risk_score if it exists in source
        src_curr.execute("PRAGMA table_info(contracts)")
        src_contract_cols = [row[1] for row in src_curr.fetchall()]
        
        has_risk_score_in_src = 'risk_score' in src_contract_cols
        
        if has_risk_score_in_src:
            query = "SELECT id, user_id, filename, original_filename, file_path, upload_date, status, total_pages, extracted_text, contract_summary, risk_score FROM contracts"
        else:
            query = "SELECT id, user_id, filename, original_filename, file_path, upload_date, status, total_pages, extracted_text, contract_summary FROM contracts"
            
        src_curr.execute(query)
        src_contracts_rows = src_curr.fetchall()
        
        for c_row in src_contracts_rows:
            if has_risk_score_in_src:
                old_cid, old_uid, filename, orig_filename, filepath, uploaddate, status, pages, text, summary, r_score = c_row
            else:
                old_cid, old_uid, filename, orig_filename, filepath, uploaddate, status, pages, text, summary = c_row
                r_score = None
                
            new_uid = user_id_map.get(old_uid)
            if not new_uid:
                print(f"  [ERROR] No mapped user ID found for contract ID {old_cid} (user ID {old_uid})")
                continue
                
            contract_key = (new_uid, filename)
            if contract_key in target_contracts:
                new_cid = target_contracts[contract_key]
                contract_id_map[old_cid] = new_cid
                print(f"  Contract '{filename}' for User ID {new_uid} already exists as ID {new_cid}")
                
                # If the target contract status is 'Pending' or similar but source is 'Analyzed', update it
                if status == 'Analyzed':
                    target_curr.execute("""
                        UPDATE contracts 
                        SET status = 'Analyzed', risk_score = ? 
                        WHERE id = ? AND (status != 'Analyzed' OR risk_score IS NULL)
                    """, (r_score, new_cid))
                    print(f"    Updated contract status to 'Analyzed' with risk_score {r_score}")
            else:
                # Insert contract into target
                target_curr.execute("""
                    INSERT INTO contracts (user_id, filename, original_filename, file_path, upload_date, status, total_pages, extracted_text, contract_summary, risk_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (new_uid, filename, orig_filename, filepath, uploaddate, status, pages, text, summary, r_score))
                new_cid = target_curr.lastrowid
                target_contracts[contract_key] = new_cid
                contract_id_map[old_cid] = new_cid
                print(f"  Inserted contract '{filename}' for User ID {new_uid} as ID {new_cid}")
                
                # Copy associated tables only for newly inserted contracts (or check them)
                # 1. Clauses
                src_curr.execute("SELECT clause_type, clause_text, confidence_score, risk_level, created_at FROM clauses WHERE contract_id = ?", (old_cid,))
                for clause in src_curr.fetchall():
                    target_curr.execute("""
                        INSERT INTO clauses (contract_id, clause_type, clause_text, confidence_score, risk_level, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (new_cid, clause[0], clause[1], clause[2], clause[3], clause[4]))
                
                # 2. Entities
                src_curr.execute("SELECT entity_type, entity_value, confidence_score, page_number, created_at FROM entities WHERE contract_id = ?", (old_cid,))
                for ent in src_curr.fetchall():
                    target_curr.execute("""
                        INSERT INTO entities (contract_id, entity_type, entity_value, confidence_score, page_number, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (new_cid, ent[0], ent[1], ent[2], ent[3], ent[4]))
                    
                # 3. Risk Reports
                src_curr.execute("SELECT overall_risk_score, risk_summary, high_risk_clauses, medium_risk_clauses, low_risk_clauses, created_at FROM risk_reports WHERE contract_id = ?", (old_cid,))
                for rep in src_curr.fetchall():
                    target_curr.execute("""
                        INSERT INTO risk_reports (contract_id, overall_risk_score, risk_summary, high_risk_clauses, medium_risk_clauses, low_risk_clauses, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (new_cid, rep[0], rep[1], rep[2], rep[3], rep[4], rep[5]))
                    
                # 4. Embedding Metadata
                src_curr.execute("SELECT chunk_index, chunk_text, vector_id, created_at FROM embedding_metadata WHERE contract_id = ?", (old_cid,))
                for emb in src_curr.fetchall():
                    target_curr.execute("""
                        INSERT INTO embedding_metadata (contract_id, chunk_index, chunk_text, vector_id, created_at)
                        VALUES (?, ?, ?, ?, ?)
                    """, (new_cid, emb[0], emb[1], emb[2], emb[3]))
        
        # Merge chat sessions
        src_curr.execute("SELECT id, user_id, contract_id, session_title, created_at FROM chat_sessions")
        src_sessions = src_curr.fetchall()
        
        for sess in src_sessions:
            old_sess_id, old_uid, old_cid, title, created = sess
            new_uid = user_id_map.get(old_uid)
            new_cid = contract_id_map.get(old_cid)
            
            if not new_uid or not new_cid:
                continue
                
            # Check if session already exists
            target_curr.execute("SELECT id FROM chat_sessions WHERE user_id = ? AND contract_id = ? AND session_title = ?", (new_uid, new_cid, title))
            existing_sess = target_curr.fetchone()
            
            if existing_sess:
                new_sess_id = existing_sess[0]
            else:
                target_curr.execute("""
                    INSERT INTO chat_sessions (user_id, contract_id, session_title, created_at)
                    VALUES (?, ?, ?, ?)
                """, (new_uid, new_cid, title, created))
                new_sess_id = target_curr.lastrowid
                print(f"  Inserted chat session '{title}' as ID {new_sess_id}")
                
                # Copy chat messages
                src_curr.execute("SELECT sender, message, created_at FROM chat_messages WHERE session_id = ?", (old_sess_id,))
                for msg in src_curr.fetchall():
                    target_curr.execute("""
                        INSERT INTO chat_messages (session_id, sender, message, created_at)
                        VALUES (?, ?, ?, ?)
                    """, (new_sess_id, msg[0], msg[1], msg[2]))
        
        src_conn.close()
        
    target_conn.commit()
    target_conn.close()
    print("\n--- DATABASE MERGE AND MIGRATION COMPLETED SUCCESSFULLY ---")

if __name__ == '__main__':
    run_merge()
