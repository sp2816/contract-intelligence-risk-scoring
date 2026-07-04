# pyrefly: ignore [missing-import]
import os
import sqlite3

from flask import Flask, jsonify
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

from extensions import db, jwt

# Load environment variables
load_dotenv()


def resolve_database_uri(raw_uri):
    if not raw_uri.startswith("sqlite:///"):
        return raw_uri

    db_file = raw_uri[len("sqlite:///") :]
    if os.path.isabs(db_file):
        return raw_uri

    backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    db_path = os.path.abspath(os.path.join(backend_dir, "app", "instance", db_file))
    return f"sqlite:///{db_path}"


def sql_type_for_column(column):
    column_type = str(column.type).upper()
    if "VARCHAR" in column_type or "CHAR" in column_type:
        return f"VARCHAR({column.type.length or 255})"
    if "INT" in column_type:
        return "INTEGER"
    if "FLOAT" in column_type or "REAL" in column_type or "NUMERIC" in column_type:
        return "REAL"
    if "BOOL" in column_type:
        return "BOOLEAN"
    if "DATETIME" in column_type or "TIMESTAMP" in column_type:
        return "TIMESTAMP"
    return "TEXT"


def auto_migrate_schema(app):
    """
    Detects missing SQLite columns by comparing the database schema with the
    SQLAlchemy models and adds them when needed at startup.
    """
    db_uri = app.config["SQLALCHEMY_DATABASE_URI"]
    if not db_uri.startswith("sqlite:///"):
        return

    db_file = db_uri[len("sqlite:///") :]
    if not os.path.exists(db_file):
        return

    conn = None
    try:
        conn = sqlite3.connect(db_file)
        cursor = conn.cursor()
        for table_name, table in db.metadata.tables.items():
            cursor.execute(
                f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"
            )
            if not cursor.fetchone():
                print(f"[AUTO-MIGRATE] Creating table {table_name}")
                table.create(db.engine)
                continue

            cursor.execute(f"PRAGMA table_info({table_name})")
            existing_cols = {row[1] for row in cursor.fetchall()}

            for column in table.columns:
                if column.name in existing_cols:
                    continue

                cursor.execute(
                    f"ALTER TABLE {table_name} ADD COLUMN {column.name} {sql_type_for_column(column)}"
                )
                print(f"[AUTO-MIGRATE] Added missing column `{column.name}` to table `{table_name}`")

        conn.commit()
    except Exception as error:
        print(f"[AUTO-MIGRATE ERROR] Migration failed: {error}")
    finally:
        if conn is not None:
            conn.close()


def create_app():
    app = Flask(__name__)

    db_uri = resolve_database_uri(os.getenv("DATABASE_URL", "sqlite:///lexai.db"))
    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024  # 15 MB upload limit

    CORS(app)

    db.init_app(app)
    jwt.init_app(app)

    uploads_dir = os.path.join(os.path.dirname(app.root_path), "uploads")
    os.makedirs(uploads_dir, exist_ok=True)

    with app.app_context():
        from models.user import User
        from models.chat import ChatSession, ChatMessage
        from models.contract import Contract, Clause, Entity, RiskReport

        print(Contract.__tablename__)
        print(Clause.__tablename__)
        print(Entity.__tablename__)
        print(RiskReport.__tablename__)

        print("Creating all tables...")
        db.create_all()
        print("Finished create_all()")

        from sqlalchemy import inspect

        inspector = inspect(db.engine)

        print("\n========== TABLES AFTER CREATE_ALL ==========")
        print(inspector.get_table_names())
        print("=============================================\n")

        print("\nDATABASE URI:", app.config["SQLALCHEMY_DATABASE_URI"])
        print("\n========== REGISTERED TABLES ==========")
        print(db.metadata.tables.keys())
        print("=======================================\n")
        auto_migrate_schema(app)

    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from routes.contracts import contracts_bp
    app.register_blueprint(contracts_bp, url_prefix="/api/contracts")

    from routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix="/api/chat")

    @app.route("/api/health", methods=["GET"])
    def health_check():
        try:
            db.session.execute(db.text("SELECT 1"))
            db_status = "connected"
        except Exception as error:
            db_status = f"disconnected: {str(error)}"

        from routes.contracts import HAS_ML
        from routes.chat import HAS_RAG

        return jsonify(
            {
                "status": "healthy",
                "database": db_status,
                "ml_pipeline": "active" if HAS_ML else "fallback_simulated",
                "rag_chatbot": "active" if HAS_RAG else "fallback_simulated",
            }
        ), 200

    return app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host="0.0.0.0", port=port)
