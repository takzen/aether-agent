@echo off
setlocal enabledelayedexpansion
title Aether Core Setup

echo =======================================================
echo          [ AETHER ] - Installation script (v1.0)
echo =======================================================
echo.
echo Checking prerequisites...

:: Check for uv (Python package manager)
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] 'uv' is not installed or not in your PATH.
    echo Please install it: curl -LsSf https://astral.sh/uv/install.ps1 ^| iex
    pause
    exit /b 1
)

:: Check for pnpm (JS package manager)
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] 'pnpm' is not installed. Trying to use npm instead.
    where npm >nul 2>nul
    if !errorlevel! neq 0 (
        echo [ERROR] Neither 'pnpm' nor 'npm' is installed. Please install Node.js.
        pause
        exit /b 1
    )
    set PACKAGE_MANAGER=npm
) else (
    set PACKAGE_MANAGER=pnpm
)

echo [OK] Prerequisites met.
echo.

:: Initialize Backend
echo =======================================================
echo [ STEP 1/2 ] Initializing Backend (Aether Core)...
echo =======================================================
cd backend
if not exist .env (
    echo Creating default .env file...
    copy .env.example .env >nul
)

echo Syncing dependencies with uv...
call uv sync

if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency installation failed.
    pause
    exit /b 1
)
cd ..
echo [OK] Backend ready.
echo.

:: Initialize Frontend
echo =======================================================
echo [ STEP 2/2 ] Initializing Frontend (Dashboard UI)...
echo =======================================================
cd frontend
echo Running !PACKAGE_MANAGER! install...
call !PACKAGE_MANAGER! install

if %errorlevel% neq 0 (
    echo [ERROR] Frontend dependency installation failed.
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend ready.
echo.

:: Summary
echo =======================================================
echo     [ SUCCESS ] Aether Environment setup complete!
echo =======================================================
echo.
echo To start the project, open two terminals:
echo Terminal 1 (Backend): cd backend ^&^& uv run python main.py
echo Terminal 2 (Frontend): cd frontend ^&^& %PACKAGE_MANAGER% dev
echo.
pause
