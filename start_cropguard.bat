@echo off
title CropGuard AI - Launcher
echo ========================================================
echo        Starting CropGuard AI Agricultural Platform
echo ========================================================
echo.

set "SCRIPT_DIR=%~dp0"

echo [1/2] Launching Backend Server (FastAPI on Port 8000)...
start "CropGuard Backend" cmd /k "call "%SCRIPT_DIR%run_backend.bat""

echo [2/2] Launching Frontend Server (Vite on Port 3000)...
start "CropGuard Frontend" cmd /k "call "%SCRIPT_DIR%run_frontend.bat""

echo.
echo Waiting 4 seconds for servers to initialize...
ping 127.0.0.1 -n 5 >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo ========================================================
echo  Platform is running!
echo   - Web App:   http://localhost:3000
echo   - API Docs:  http://127.0.0.1:8000/docs
echo ========================================================
