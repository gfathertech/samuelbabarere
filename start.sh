#!/bin/bash

# Kill any existing node processes running Vite or server
pkill -f "vite" || true
pkill -f "tsx" || true

# Start the client in dev mode
echo "Starting client in development mode..."
cd client && npm run dev 