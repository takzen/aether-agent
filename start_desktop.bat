@echo off
setlocal enabledelayedexpansion
title Aether Core Desktop Launcher

echo =======================================================
echo          [ AETHER ] - Desktop Start (v1.0)
echo =======================================================
echo.
echo Checking dependencies...

:: Initialize Backend
start "Aether Backend" cmd /c "cd backend && uv run python main.py"
echo [OK] Backend Started.

:: Initialize Frontend
start "Aether Frontend" cmd /c "cd frontend && pnpm dev"
echo [OK] Frontend Started.

:: Initialize Electron Desktop App
echo Starting Electron Window...
cd desktop
if not exist node_modules (
    echo [INFO] Installing Electron dependencies...
    call npm install
)
call npm start

echo [Shutdown] Electron closed.
:: Ask to kill frontend & backend? Maybe next time. 
pause
