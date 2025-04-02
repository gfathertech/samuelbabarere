#!/bin/bash

# Make the script executable
chmod +x start.sh

# Kill any existing node processes running Vite
pkill -f "vite --port 3000" || true

# Start the frontend only for now
echo "Starting frontend..."
cd client && npm run dev