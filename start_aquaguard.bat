@echo off
echo =====================================================================
echo               STARTING AQUAGUARD AI PLATFORM
echo   AI Water Quality Analysis, Drinking Safety & Environmental Monitor
echo =====================================================================
echo.

echo [1/2] Launching AquaGuard AI FastAPI Backend on http://localhost:8000 ...
start "AquaGuard Backend" cmd /k "python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching AquaGuard AI React Frontend on http://localhost:5173 ...
cd frontend
start "AquaGuard Frontend" cmd /k "npm run dev"

echo.
echo =====================================================================
echo AquaGuard AI is now running!
echo Frontend UI: http://localhost:5173
echo API Docs:    http://localhost:8000/docs
echo =====================================================================
