# AI Contract Intelligence & Risk Scoring Platform

Welcome to the **AI Contract Intelligence & Risk Scoring Platform**, a secure, real-time enterprise workspace for legal teams to analyze contract risks, automate clause reviews, and interact with documents using a legal chatbot assistant.

---

## Repository Structure

- **/backend**: Flask API server, SQLAlchemy ORM, and SQLite database instance.
- **/frontend**: React + Vite single page application styled with TailwindCSS (dark-mode aesthetic and glassmorphism).

---

## Prerequisites

Before running the application, make sure you have the following installed on your machine:
1. **Node.js** (v18.x or higher) & **npm**
2. **Python** (v3.10.x or higher)
3. **SQLite** (usually pre-installed with Python)

---

## Step-by-Step Setup Guide

### 1. Database Initialization & Seeding

The application uses a local SQLite database located in `backend/app/instance/lexai.db`. You must initialize the schema and seed it with default records (including default users and contracts) before launching the backend.

1. Open your terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Activate your virtual environment:
   * **Windows (PowerShell/CMD):**
     ```powershell
     .venv\Scripts\activate
     # OR (if using the other env folder)
     cirs_env\Scripts\activate
     ```
   * **macOS/Linux:**
     ```bash
     source .venv/bin/activate
     ```
3. Run the database initialization and seeding script:
   ```bash
   python init_db.py
   ```
   *This creates the database, initializes the tables (users, contracts, clauses, risk reports, chat sessions), and inserts default accounts and contracts.*

---

### 2. Running the Backend (Flask API Server)

1. Ensure your virtual environment is still active and navigate to the backend application directory:
   ```bash
   cd backend/app
   ```
2. Launch the Flask API server:
   ```bash
   python main.py
   ```
   *The server will start running on [http://localhost:5000](http://localhost:5000) (or `http://127.0.0.1:5000`). Keep this terminal open.*

---

### 3. Running the Frontend (React + Vite Client)

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the node package dependencies (only needed on first run):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will compile and become accessible on [http://localhost:5173](http://localhost:5173). Open this link in your browser.*

---

## Authentication & Verification

### Seeded Credentials
You can log in to the workspace immediately using the following pre-seeded developer/demo accounts:
- **Demo Legal Counsel:**
  * **Email:** `demo@lexai-intel.com`
  * **Password:** `password123`
- **Admin Legal Reviewer:**
  * **Email:** `admin@lexai-intel.com`
  * **Password:** `adminsecure`

### Registering New Users
You can also register a completely new user on the **Sign Up** page. 
- Newly registered accounts are instantly created in the live SQLite database.
- Every new user is initialized with a default set of preferences (e.g. Dark Theme, default dashboard view, email notifications) and automatically logged into their workspace.
- You can manage and save your preferences in real-time from the **Profile / Settings** page, which are persisted directly to the backend database.
