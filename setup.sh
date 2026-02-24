#!/usr/bin/env bash

# Stop execution if any command fails
set -e

echo "======================================================="
echo "         [ AETHER ] - Installation script (v1.0)"
echo "======================================================="
echo ""
echo "Checking prerequisites..."

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "[ERROR] 'uv' is not installed."
    echo "Please install it: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check for pnpm or npm
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    echo "[WARNING] 'pnpm' is not installed. Trying to use npm instead."
    PACKAGE_MANAGER="npm"
else
    echo "[ERROR] Neither 'pnpm' nor 'npm' is installed. Please install Node.js."
    exit 1
fi

echo "[OK] Prerequisites met."
echo ""

# Initialize Backend
echo "======================================================="
echo "[ STEP 1/2 ] Initializing Backend (Aether Core)..."
echo "======================================================="
cd backend

if [ ! -f .env ]; then
    echo "Creating default .env file..."
    cp .env.example .env
fi

echo "Syncing dependencies with uv..."
uv sync
cd ..
echo "[OK] Backend ready."
echo ""

# Initialize Frontend
echo "======================================================="
echo "[ STEP 2/2 ] Initializing Frontend (Dashboard UI)..."
echo "======================================================="
cd frontend
echo "Running $PACKAGE_MANAGER install..."
$PACKAGE_MANAGER install

# Ensure landing page exists (open source template)
if [ ! -f src/app/page.tsx ]; then
    echo "[INFO] Setting up default landing page..."
    cp src/app/page.opensource.tsx src/app/page.tsx
    echo "[OK] Landing page created from template."
fi

cd ..
echo "[OK] Frontend ready."
echo ""

# Summary
echo "======================================================="
echo "    [ SUCCESS ] Aether Environment setup complete!"
echo "======================================================="
echo ""
echo "To start the project, open two separate terminal sessions:"
echo "Terminal 1 (Backend): cd backend && uv run python main.py"
echo "Terminal 2 (Frontend): cd frontend && $PACKAGE_MANAGER dev"
echo ""
