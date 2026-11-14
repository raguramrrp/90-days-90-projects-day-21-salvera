# SALVERA Quickstart Guide

Get **SALVERA** running locally on Windows in under 2 minutes.

---

## Method 1: One-Click Automated Windows Setup (Recommended)

1. Open PowerShell or Command Prompt in the project directory:
   ```powershell
   cd "D:\90 days\90-days-90-projects-day-21-salvera"
   ```

2. Run the automated setup script:
   ```cmd
   setup.bat
   ```
   *This automatically sets up Python 3.12 `.venv`, installs requirements, generates 2,250 benchmark records, seeds the database, trains the Scikit-learn ML models, and builds the React frontend.*

3. Start the application:
   ```cmd
   run.bat
   ```
   *This opens the FastAPI Backend API on `http://127.0.0.1:8000` and the Vite Web UI on `http://localhost:5173`.*

---

## Method 2: Manual Step-by-Step Setup

### 1. Backend Setup
```powershell
# Create Python 3.12 virtual environment
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Generate benchmark dataset
python backend/scripts/generate_demo_data.py

# Initialize and seed database
python backend/scripts/seed_db.py

# Train Scikit-learn regression models
python backend/scripts/train_model.py

# Start FastAPI server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup (New Terminal)
```powershell
cd frontend
npm install
npm run dev
```

### 3. Open in Browser
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Interactive OpenAPI Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## Running Automated Tests
```cmd
test.bat
```
Or directly via pytest:
```powershell
.\.venv\Scripts\pytest tests/test_services.py -v
```
