#!/bin/bash

# Start the client development server
echo "Starting client dev server..."
cd client && npm run dev &

# Wait a moment to make sure client server starts
sleep 5

# Start the server development server
echo "Starting server dev server..."
cd server && npm run dev

# This will keep the script running until both servers exit
wait