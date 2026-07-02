# pyrefly: ignore [missing-import]
from flask import Flask
from flask_cors import CORS
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv
from extensions import db, jwt
import os

# Load environment variables
load_dotenv()

def auto_migrate_schema(app):
    """
    Automatically detects missing columns in the SQLite database by comparing
    them against the SQLAlchemy models, and executes ALTER TABLE statements 
    to add them at startup. Prevents 'no such column' errors on schema updates.
    """
    import sqlite3
    db_uri = app.config['SQLALCHEMY_DATABASE_URI']
    if db_uri.startswith('sqlite:///'):
        db_file = db_uri[len('sqlite:///'):]
        if os.path.exists(db_file):
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                for table_name, table in db.metadata.tables.items():
                    # Check if table exists
                    cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'")
                    if not cursor.fetchone():
                        print(f"[AUTO-MIGRATE] Creating table {table_name}")
                        table.create(db.engine)
                        continue
                    
                    # Get existing columns
                    cursor.execute(f"PRAGMA table_info({table_name})")
                    existing_cols = {row[1] for row in cursor.fetchall()}
                    
                    for column in table.columns:
                        if column.name not in existing_cols:
                            col_type = str(column.type).upper()
                            if 'VARCHAR' in col_type or 'CHAR' in col_type:
                                sql_type = f'VARCHAR({column.type.length or 255})'
                            elif 'INT' in col_type:
                                sql_type = 'INTEGER'
                            elif 'FLOAT' in col_type or 'REAL' in col_type or 'NUMERIC' in col_type:
                                sql_type = 'REAL'
                            elif 'BOOL' in col_type:
                                sql_type = 'BOOLEAN'
                            elif 'DATETIME' in col_type or 'TIMESTAMP' in col_type:
                                sql_type = 'TIMESTAMP'
                            else:
                                sql_type = 'TEXT'
                            
                            cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {column.name} {sql_type}")
                            print(f"[AUTO-MIGRATE] Added missing column `{column.name}` to table `{table_name}`")
                conn.commit()
                conn.close()
            except Exception as e:
                print(f"[AUTO-MIGRATE ERROR] Migration failed: {e}")

def create_app():
    app = Flask(__name__)
    
    # Configuration
    db_uri = os.getenv('DATABASE_URL', 'sqlite:///lexai.db')
    if db_uri.startswith('sqlite:///'):
        db_file = db_uri[len('sqlite:///'):]
        if not os.path.isabs(db_file):
            backend_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
            db_path = os.path.abspath(os.path.join(backend_dir, 'app', 'instance', db_file))
            db_uri = f"sqlite:///{db_path}"
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['MAX_CONTENT_LENGTH'] = 15 * 1024 * 1024  # 15 MB upload limit
    
    # Enable CORS
    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    
    # Create database tables
    # Create uploads directory
    uploads_dir = os.path.join(os.path.dirname(app.root_path), 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Create database tables
    with app.app_context():
        from models.user import User
        from models.chat import ChatSession, ChatMessage

        # Import ALL models from contract.py
        from models.contract import (
            Contract,
            Clause,
            Entity,
            RiskReport,
        )

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
        
    # Register blueprints
    from routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    from routes.contracts import contracts_bp
    app.register_blueprint(contracts_bp, url_prefix='/api/contracts')
    
    from routes.chat import chat_bp
    app.register_blueprint(chat_bp, url_prefix='/api/chat')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        from flask import jsonify
        try:
            db.session.execute(db.text('SELECT 1'))
            db_status = 'connected'
        except Exception as e:
            db_status = f'disconnected: {str(e)}'

        from routes.contracts import HAS_ML
        from routes.chat import HAS_RAG

        return jsonify({
            'status': 'healthy',
            'database': db_status,
            'ml_pipeline': 'active' if HAS_ML else 'fallback_simulated',
            'rag_chatbot': 'active' if HAS_RAG else 'fallback_simulated'
        }), 200
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
