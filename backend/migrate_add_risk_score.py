"""
migrate_add_risk_score.py
────────────────────────────────────────────────────────────────────────────────
One-shot migration: adds the `risk_score` REAL column to the `contracts` table
in the existing SQLite database.  Safe to run multiple times — it checks first.

Usage (from the project root or backend/ directory):
    python migrate_add_risk_score.py
────────────────────────────────────────────────────────────────────────────────
"""

import os
import sqlite3

# ── Locate the database file ──────────────────────────────────────────────────
# Flask defaults: backend/app/instance/lexai.db  OR  backend/instance/lexai.db
_CANDIDATES = [
    os.path.join(os.path.dirname(__file__), 'app', 'instance', 'lexai.db'),
    os.path.join(os.path.dirname(__file__), 'instance', 'lexai.db'),
    os.path.join(os.path.dirname(__file__), '..', 'instance', 'lexai.db'),
]

db_path = None
for candidate in _CANDIDATES:
    if os.path.exists(candidate):
        db_path = os.path.abspath(candidate)
        break

if db_path is None:
    print("[ERROR] Could not locate lexai.db. Tried:")
    for c in _CANDIDATES:
        print(f"     {os.path.abspath(c)}")
    print("\nSet db_path manually in this script and re-run.")
    raise SystemExit(1)

print(f"[OK] Using database: {db_path}")

# ── Connect and migrate ───────────────────────────────────────────────────────
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check existing columns
cursor.execute("PRAGMA table_info(contracts)")
columns = {row[1] for row in cursor.fetchall()}

if 'risk_score' in columns:
    print("[INFO] Column `risk_score` already exists -- nothing to do.")
else:
    cursor.execute("ALTER TABLE contracts ADD COLUMN risk_score REAL")
    conn.commit()
    print("[OK] Added column `risk_score REAL` to `contracts` table.")

conn.close()
print("[DONE] Migration complete.")
