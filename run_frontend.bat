@echo off
title CropGuard AI - Frontend Server (Port 3000)
cd /d "%~dp0frontend"
set "NODE_DIR=%~dp0tools\nodejs"
set "PATH=%NODE_DIR%;%PATH%"

echo ========================================================
echo  Starting CropGuard AI Frontend on http://localhost:3000
echo ========================================================
echo.

call "%NODE_DIR%\npm.cmd" run dev -- --host 0.0.0.0 --port 3000
pause

