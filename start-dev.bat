@echo off
echo Starting PreHire Development Environment...

echo.
echo Starting MongoDB (make sure MongoDB is installed and running)
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting AI Service...
start "AI Service" cmd /k "cd ai-service && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo All services are starting...
echo Backend: http://localhost:5000
echo AI Service: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
pause