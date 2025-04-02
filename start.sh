#!/bin/bash

# Make the script executable
chmod +x start.sh

# Kill any existing node processes running Vite
pkill -f "vite" || true

# Build the application first
echo "Building the frontend application..."
cd client && npm run build

# Start the preview server (serving built files)
echo "Starting preview server..."
npm run preview
