@echo off
echo ===================================================
echo   PreHire Demo Startup Script
echo ===================================================

echo.
echo [1/2] Checking for dependencies...

REM Install root dependencies (concurrently) if missing
if not exist "node_modules" (
    echo    Installing root dependencies...
    call npm install
)

REM Install service dependencies if missing
if not exist "backend\node_modules" (
    echo    Installing service dependencies...
    call npm run install-all
)

echo.
echo [2/2] Starting all services...
echo    - Backend (Port 5001)
echo    - AI Service (Port 3001)
echo    - Frontend (Port 3000)
echo.
echo Press Ctrl+C to stop all services.
echo.

npm run dev
