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
echo [CORE] Igniting Backend...
echo [INFO] Waiting for Kernel to reach consensus (127.0.0.1:8000)...

:wait_loop
set "READY=0"
for /f "tokens=*" %%a in ('powershell -Command "try { $res = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/ping' -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue; if($res.StatusCode -eq 200){ write-host 1 }else{ write-host 0 } } catch { write-host 0 }"') do set "READY=%%a"

if "%READY%"=="1" (
    echo [OK] Kernel is ONLINE.
    goto start_services
)

echo [WAIT] Kernel is still starting... (retrying in 3s)
timeout /t 3 /nobreak >nul
goto wait_loop

:start_services
:: Ensure landing page exists (open source template)
if not exist frontend\src\app\page.tsx (
    echo [INFO] Setting up default landing page...
    copy frontend\src\app\page.opensource.tsx frontend\src\app\page.tsx >nul
)

:: Initialize Frontend
start "Aether Frontend" cmd /c "cd frontend && pnpm dev"
echo [OK] Frontend Engine Sparked.

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
