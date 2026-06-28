#!/bin/bash
# Run both services locally (VS Code / any terminal)
# Requires .env files — copy from .env.example and fill in your secrets

set -e

echo "Building libs..."
pnpm run typecheck:libs

echo "Building API server..."
(cd artifacts/api-server && NODE_ENV=development pnpm run build)

echo "Starting services..."

# API server — Terminal 1 equivalent
(cd artifacts/api-server && node --env-file=.env --enable-source-maps ./dist/index.mjs) &
API_PID=$!

# Frontend — Terminal 2 equivalent (Vite auto-loads .env)
(cd artifacts/redeemers-forge && pnpm run dev) &
VITE_PID=$!

trap "kill $API_PID $VITE_PID 2>/dev/null; exit" INT TERM

echo ""
echo "  API server → http://localhost:8080"
echo "  Frontend   → http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both."
wait
