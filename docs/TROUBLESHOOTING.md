# SALVERA — Troubleshooting Guide

Common setup, execution, and environment issues with solutions for Windows.

---

### 1. Port Conflict on Port 8000 or 5173
- **Symptom:** `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)` or `Port 5173 is in use`.
- **Solution:** Identify and terminate the occupying process, or launch on an alternative port:
  ```powershell
  # Find PID using port 8000
  Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
  Stop-Process -Id <PID> -Force
  ```

### 2. Missing Python 3.12 Wheels on Windows
- **Symptom:** `error: Microsoft Visual C++ 14.0 or greater is required` during pip install.
- **Solution:** SALVERA requires **Python 3.12 (64-bit)** where official precompiled binary wheels exist for `scikit-learn`, `numpy`, `scipy`, and `pandas`. If you are using Python 3.14 pre-release, use `setup.bat` which automatically selects Python 3.12 if installed.

### 3. Database Reset / Clean State
- **Symptom:** You want to re-seed the demonstration dataset or clear custom uploaded records.
- **Solution:** Run the seed script:
  ```powershell
  .\.venv\Scripts\python.exe backend\scripts\seed_db.py
  ```
  *This safely clears and re-seeds all 2,250 records and initial comparison models.*

### 4. Missing ML Model Artifact
- **Symptom:** API returns `503 Salary ML model not initialized`.
- **Solution:** Retrain the model:
  ```powershell
  .\.venv\Scripts\python.exe backend\scripts\train_model.py
  ```
  *This trains Linear Regression, Random Forest, and Gradient Boosting and regenerates `models/salary_model.joblib`.*
