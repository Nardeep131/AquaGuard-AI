#!/bin/bash
echo "====================================================================="
echo "              STARTING AQUAGUARD AI PLATFORM"
echo "  AI Water Quality Analysis, Drinking Safety & Environmental Monitor"
echo "====================================================================="
echo ""

echo "[1/2] Launching AquaGuard AI FastAPI Backend on http://localhost:8000 ..."
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo "[2/2] Launching AquaGuard AI React Frontend on http://localhost:5173 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "====================================================================="
echo "AquaGuard AI is running!"
echo "Frontend UI: http://localhost:5173"
echo "API Docs:    http://localhost:8000/docs"
echo "====================================================================="

wait $BACKEND_PID $FRONTEND_PID
