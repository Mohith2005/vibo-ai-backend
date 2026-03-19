@echo off
title Vibo AI Global Production Server Gateway

echo =======================================================
echo  VIBO AI - STARTING GLOBAL CLOUD ENVIRONMENT
echo =======================================================

echo 1/3: Starting Python AI Server (Face Detection)...
start "Python API" cmd /k "cd backend && venv\Scripts\python.exe app.py"

echo 2/3: Starting Node.js Media Server (Music Streaming)...
start "Node API" cmd /k "cd backend-node && node server.js"

echo Waiting 5 seconds for servers to map to local ports...
timeout /T 5 /NOBREAK >nul

echo 3/3: Opening Global Tunnels (Connecting to Internet)...
start "Internet Gateway" cmd /k "call start_tunnels.bat"

echo =======================================================
echo DONE! 
echo Your PC is now actively hosting Vibo AI to the world.
echo You can now install the new APK on ANY phone and ANY network.
echo Leave these newly opened terminal windows running!
echo =======================================================
pause
