@echo off
setlocal enabledelayedexpansion
echo =====================================================================
echo         SALVERA - Technology Salary & Career Intelligence Platform
echo                         Application Launcher
echo =====================================================================
echo.

cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please execute setup.bat first.
    pause
    exit /b 1
)

echo [*] Starting FastAPI Backend API on http://127.0.0.1:8000...
start "SALVERA Backend API" cmd /k "cd /d "%~dp0" && .venv\Scripts\uvicorn.exe backend.app.main:app --host 127.0.0.1 --port 8000"

echo [*] Starting Vite Frontend on http://localhost:5173...
start "SALVERA Frontend Web UI" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo.
echo =====================================================================
echo [ONLINE] SALVERA is running locally!
echo.
echo   - Web Application:  http://localhost:5173
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo   - Health Check:     http://127.0.0.1:8000/api/health
echo.
echo Keep the launched terminal windows open while using SALVERA.
echo Close both windows to stop the platform.
echo =====================================================================
pause
