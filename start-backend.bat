@echo off
title Build Market - Backend API Server
echo ========================================================
echo Starting Build Market Express REST API (Port 5000)
echo ========================================================

set PATH=%~dp0tools\nodejs\node-v20.18.0-win-x64;%PATH%
cd /d "%~dp0backend"

node server.js
pause
