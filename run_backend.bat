@echo off
title CropGuard AI - Backend Server (Port 8000)
cd /d "%~dp0backend"
set "PYTHON_EXE=%~dp0tools\python\python.exe"

echo ========================================================
echo  Starting CropGuard AI Backend on http://127.0.0.1:8000
echo ========================================================
echo.

"%PYTHON_EXE%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause

