#!/bin/bash

echo "🚀 Starting WEX FSA Provider Substantiation Demo..."
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Install Flask dependencies if not already installed
echo "📦 Installing Python dependencies..."
pip3 install -r wex-fsa-provider-substantiation-backend/requirements.txt

echo ""
echo "🌐 Starting Backend Server..."
echo "📍 Backend will run on: http://localhost:4000"
echo ""

# Start backend server in background
cd wex-fsa-provider-substantiation-backend
python3 src/server.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo ""
echo "🎨 Starting Frontend..."
echo "📍 Frontend will run on: http://localhost:3000"
echo ""

# Start frontend server (simple HTTP server)
cd ../wex-fsa-provider-substantiation-frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!

echo ""
echo "✅ Demo is starting up!"
echo ""
echo "📱 Open your browser and go to: http://localhost:3000"
echo ""
echo "🔍 API Endpoints:"
echo "   Health Check: http://localhost:4000/health"
echo "   Link Account: POST http://localhost:4000/link-account"
echo "   Events: http://localhost:4000/events"
echo ""
echo "🎬 Demo Flow:"
echo "   1. Click 'Connect My Provider'"
echo "   2. Wait for authentication (2 seconds)"
echo "   3. See transaction appear as 'Pending'"
echo "   4. Watch it auto-approve (3 seconds)"
echo ""
echo "🛑 To stop the demo, press Ctrl+C"
echo ""

# Wait for user to stop
wait
