@echo off
title Build Market - React Frontend
echo ========================================================
echo Starting Build Market React Frontend (Port 3000)
echo ========================================================

set PATH=%~dp0tools\nodejs\node-v20.18.0-win-x64;%PATH%
cd /d "%~dp0frontend"

npm run dev
pause
