@echo off
setlocal
echo =====================================================================
echo         SALVERA - Automated Test Suite and Integrity Validation
echo =====================================================================
echo.

cd /d "%~dp0"

if not exist ".venv\Scripts\pytest.exe" (
    echo [ERROR] Virtual environment or pytest not found. Run setup.bat first.
    exit /b 1
)

echo [*] Executing Pytest Backend Service, Jobs, and Calculation Tests...
".venv\Scripts\pytest.exe" tests/ -v
if %errorlevel% neq 0 (
    echo [FAIL] Automated backend tests failed.
    exit /b %errorlevel%
)

echo.
echo [*] Checking ML Model Artifacts...
if not exist "models\salary_model.joblib" (
    echo [FAIL] models\salary_model.joblib missing.
    exit /b 1
)
if not exist "models\model_metrics.json" (
    echo [FAIL] models\model_metrics.json missing.
    exit /b 1
)
echo [PASS] ML model artifacts verified.

echo.
echo [*] Checking Frontend Production Build...
if not exist "frontend\dist\index.html" (
    echo [WARNING] frontend\dist\index.html missing. Building frontend...
    cd frontend && call npm run build && cd ..
)
if not exist "frontend\dist\index.html" (
    echo [FAIL] Frontend build verification failed.
    exit /b 1
)
echo [PASS] Frontend production build verified.

echo.
echo =====================================================================
echo [PASS] ALL VALIDATION CHECKS AND AUTOMATED TESTS PASSED!
echo =====================================================================
exit /b 0
