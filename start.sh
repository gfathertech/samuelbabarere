
# Make the script executable
chmod +x start.sh

# Start the backend server
#echo "Starting backend..."
#cd server && tsx index.ts &

# Wait for backend to initialize
#sleep 2

# Start the frontend
echo "Starting frontend..."
cd client && npm run dev
