# 📋 Full Run‑Through (Windows CMD)

## 1️⃣ Prerequisites (install once)
| Tool | Minimum version | Install command (run in **CMD**) |
|------|----------------|-----------------------------------|
| **Node.js** (LTS) | 20.x | `winget install OpenJS.Nodejs` |
| **Python** | 3.11+ | `winget install Python.Python.3` |
| **Git** | 2.45+ | `winget install Git.Git` |
| **Visual Studio Code** (optional) | any | download from https://code.visualstudio.com |

> **Note**: After installing Node, you can verify with `node -v` and `npm -v`.

## 2️⃣ Clone the repository & checkout the branch
```cmd
REM 1️⃣ Clone the repo
git clone https://github.com/your-org/contract-intelligence-risk-scoring.git "d:\INTERNSHIP\Project-2"

REM 2️⃣ Enter the repo folder
cd "d:\INTERNSHIP\Project-2"

REM 3️⃣ Checkout the feature branch that contains the frontend changes
git checkout feature/frontend-backend
:: If the branch does not exist locally, run:
:: git fetch origin && git checkout feature/frontend-backend
```

## 3️⃣ Set up the **FastAPI backend**
### 3.1 Create a virtual environment (CMD)
```cmd
REM Inside the repo root (still in d:\INTERNSHIP\Project-2)
python -m venv .venv
\.venv\Scripts\activate.bat   REM activate for CMD
```
### 3.2 Install Python dependencies
```cmd
pip install -r backend\requirements.txt
```
### 3.3 Configure environment variables
Create a file `backend\.env` (you may copy `.env.example`). Minimum contents:
```
# backend/.env
SECRET_KEY=super-secret-key-change-me
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:5173
```
### 3.4 Run the FastAPI server
```cmd
REM Ensure the virtual environment is activated and dependencies installed
python backend/app/main.py
```
You should see `Uvicorn running on http://127.0.0.1:5000`.

## 4️⃣ Set up the **frontend (React + Vite)**
### 4.1 Install npm packages
```cmd
cd frontend
npm install
```
If you see `npm : The term 'npm' is not recognized` make sure Node is on your PATH and restart CMD.
### 4.2 (Optional) Create a `.env` for Vite
Create `frontend\.env` with:
```
VITE_API_BASE_URL=http://localhost:5000/api
```
### 4.3 Run the dev server
```cmd
npm run dev
```
The console will output something like:
```
  VITE v8.0.12  ready in 724 ms
  ➜  Local:   http://127.0.0.1:5173/
```
Open that URL in Chrome/Edge.

## 5️⃣ Verify the full flow
1. **Login** – use a registered user or register first. After submitting you should see a toast “Login successful” and be redirected to `/dashboard`.
2. **Dashboard** – only accessible with a valid JWT stored by `src/utils/tokenManager.js`.
3. **Logout** – click the logout button (usually in the navbar). Token is cleared, toast shows “Logged out”, and you return to `/login`.
4. **Register** – fill the form, see inline validation errors, then success toast and redirect.
5. **Expired token** – manually edit the `ai-contract-user` entry in `localStorage` to an invalid JWT, then try to access a protected page. The Axios interceptor will try `/auth/refresh-token`; on failure you are logged out.

## 6️⃣ Production build (optional)
```cmd
npm run build   REM creates ./dist
```
You can serve the static files with any web server (e.g., `python -m http.server 8080` inside `frontend/dist`), or let FastAPI serve them:
```python
# Add to backend/app/main.py
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="frontend")
```
Then run the backend as before; the UI will be reachable at `http://localhost:5000/`.

## 7️⃣ Quick troubleshooting (CMD) ✅
| Symptom | Fix |
|---------|-----|
| `npm` not recognized | Ensure Node is on PATH; reopen CMD after install. |
| CORS error in browser | Verify `backend/.env` contains `CORS_ORIGINS=http://localhost:5173` and restart the API. |
| Login always fails | Open DevTools → Network, check request to `/auth/login`. Ensure the backend route exists (`/auth/login`). |
| Token never saved | Look in Chrome DevTools → Application → Local Storage for key `ai-contract-user`. |
| Backend port already in use | Find PID: `netstat -ano | findstr :5000` then `taskkill /PID <pid> /F`. |

---
**You’re all set!** Open two CMD windows: one for the backend (`uvicorn …`) and one for the frontend (`npm run dev`). Enjoy the fully‑connected, secure UI.


**Final Commands to run the Code** 
Both servers are now successfully running in the background:

Flask Backend:

Command: backend\.venv\Scripts\python.exe backend/app/main.py
URL: http://localhost:5000
API Endpoints: /api/auth/* and /api/contracts/*
Frontend React+Vite:

Command: cmd.exe /c npm run dev
URL: http://localhost:5173
You can now open http://localhost:5173 in your browser to access the project and test the fixed authentication and password reset flows!