
# Make the script executable
chmod +x start.sh

# Start the frontend only for now
echo "Starting frontend..."
cd client && npm run dev
