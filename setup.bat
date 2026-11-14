@echo off
setlocal enabledelayedexpansion
echo =====================================================================
echo         SALVERA - Technology Salary & Career Intelligence Platform
echo                 Automated Windows Setup Script
echo =====================================================================
echo.

cd /d "%~dp0"

:: 1. Detect Python 3.12 or compatible python
set "PY_CMD="
if exist "C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe" (
    set "PY_CMD=C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python312\python.exe"
) else (
    where py >nul 2>&1
    if !errorlevel! equ 0 (
        set "PY_CMD=py -3.12"
    ) else (
        where python >nul 2>&1
        if !errorlevel! equ 0 (
            set "PY_CMD=python"
        )
    )
)

if "%PY_CMD%"=="" (
    echo [ERROR] Python 3.12 or compatible Python not found. Please install Python 3.12.
    exit /b 1
)

echo [*] Using Python: %PY_CMD%

:: 2. Create Virtual Environment
if not exist ".venv" (
    echo [*] Creating Python virtual environment in .venv...
    %PY_CMD% -m venv .venv
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create virtual environment.
        exit /b 1
    )
) else (
    echo [*] Virtual environment .venv already exists.
)

:: 3. Install Python Dependencies
echo [*] Installing backend dependencies from requirements.txt...
".venv\Scripts\pip.exe" install -r requirements.txt
if !errorlevel! neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    exit /b 1
)

:: 4. Generate Synthetic Benchmark Dataset
echo [*] Generating realistic tech benchmark salary records...
".venv\Scripts\python.exe" backend\scripts\generate_demo_data.py
if !errorlevel! neq 0 (
    echo [ERROR] Failed to generate demo data.
    exit /b 1
)

:: 5. Initialize & Seed Database
echo [*] Initializing database and seeding records...
".venv\Scripts\python.exe" backend\scripts\seed_db.py
if !errorlevel! neq 0 (
    echo [ERROR] Failed to seed database.
    exit /b 1
)

:: 6. Train Machine Learning Models
echo [*] Training Scikit-learn salary regression models...
".venv\Scripts\python.exe" backend\scripts\train_model.py
if !errorlevel! neq 0 (
    echo [ERROR] Failed to train ML models.
    exit /b 1
)

:: 7. Install Frontend Dependencies & Build
echo [*] Checking frontend dependencies...
if exist "frontend" (
    cd frontend
    where npm >nul 2>&1
    if !errorlevel! equ 0 (
        echo [*] Installing frontend npm packages...
        call npm install
        echo [*] Building production frontend bundles...
        call npm run build
    ) else (
        echo [WARNING] Node/npm not found on PATH. Frontend must be built separately.
    )
    cd ..
)

echo.
echo =====================================================================
echo [SUCCESS] SALVERA setup completed successfully!
echo Run 'run.bat' to launch the backend API and frontend application.
echo =====================================================================
pause
