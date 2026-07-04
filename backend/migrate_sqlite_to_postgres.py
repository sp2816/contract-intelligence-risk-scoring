import sqlite3
import psycopg2

# ---------- SQLite ----------
sqlite_conn = sqlite3.connect("app/instance/lexai.db")
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

# ---------- PostgreSQL ----------
pg_conn = psycopg2.connect(
    host="localhost",
    database="contract_intelligence",
    user="postgres",
    password="postgres",   # Change if needed
    port="5432"
)

pg_cur = pg_conn.cursor()


TABLES = [
    "users",
    "contracts",
    "clauses",
    "risk_reports",
    "entities",
    "chat_sessions",
    "chat_messages"
]

for table in TABLES:

    print(f"\nMigrating {table}...")

    sqlite_cur.execute(f"SELECT * FROM {table}")
    rows = sqlite_cur.fetchall()

    if len(rows) == 0:
        print("No rows.")
        continue

    columns = rows[0].keys()

    column_names = ", ".join(columns)
    placeholders = ", ".join(["%s"] * len(columns))

    insert_query = (
        f"INSERT INTO {table} ({column_names}) "
        f"VALUES ({placeholders})"
    )

    count = 0

    for row in rows:

        values = []

        for col in columns:

            value = row[col]

            # SQLite INTEGER -> PostgreSQL BOOLEAN
            if table == "users" and col == "is_active":
                value = bool(value)

            values.append(value)

        pg_cur.execute(insert_query, values)
        count += 1

    pg_conn.commit()

    print(f"{count} rows migrated.")

print("\nMigration completed successfully.")

sqlite_conn.close()
pg_conn.close()