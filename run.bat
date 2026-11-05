@echo off
title SYNEXAN Agent Skill Hub
cd /d "%~dp0"

echo ===================================================
echo     SYNEXAN - AI Agent Skill Management Hub
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Installing required dependencies...
    call npm install
)

echo [INFO] Starting Backend Server and Web UI...
start "" http://localhost:8080
node server/app.js

pause
