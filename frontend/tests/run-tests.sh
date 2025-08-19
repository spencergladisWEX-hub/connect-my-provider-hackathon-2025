#!/bin/bash

echo "🧪 WEX Frontend Testing Suite"
echo "=============================="
echo ""

# Check if we're in the right directory
if [ ! -f "test-runner.html" ]; then
    echo "❌ Error: Please run this script from the frontend/tests directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: frontend/tests/"
    echo ""
    echo "   To fix: cd frontend/tests && ./run-tests.sh"
    exit 1
fi

echo "✅ Test environment found"
echo "📁 Test files:"
ls -la test-suites/
echo ""

# Check if Python is available for simple HTTP server
if command -v python3 &> /dev/null; then
    echo "🚀 Starting test server..."
    echo "📍 Test runner will be available at: http://localhost:8000/test-runner.html"
    echo ""
    echo "📱 Open your browser and navigate to:"
    echo "   http://localhost:8000/test-runner.html"
    echo ""
    echo "🎯 Available test categories:"
    echo "   • Unit Tests - Core functionality testing"
    echo "   • Integration Tests - Component interaction testing"
    echo "   • UI Tests - Visual and responsive design testing"
    echo ""
    echo "🛑 Press Ctrl+C to stop the test server"
    echo ""
    
    # Start HTTP server
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🚀 Starting test server..."
    echo "📍 Test runner will be available at: http://localhost:8000/test-runner.html"
    echo ""
    echo "📱 Open your browser and navigate to:"
    echo "   http://localhost:8000/test-runner.html"
    echo ""
    echo "🎯 Available test categories:"
    echo "   • Unit Tests - Core functionality testing"
    echo "   • Integration Tests - Component interaction testing"
    echo "   • UI Tests - Visual and responsive design testing"
    echo ""
    echo "🛑 Press Ctrl+C to stop the test server"
    echo ""
    
    # Start HTTP server
    python -m http.server 8000
else
    echo "⚠️  Python not found. Opening test runner directly..."
    echo ""
    echo "📱 Opening test-runner.html in default browser..."
    
    # Try to open the test runner directly
    if command -v open &> /dev/null; then
        # macOS
        open test-runner.html
    elif command -v xdg-open &> /dev/null; then
        # Linux
        xdg-open test-runner.html
    elif command -v start &> /dev/null; then
        # Windows
        start test-runner.html
    else
        echo "❌ Could not automatically open browser"
        echo "   Please manually open: $(pwd)/test-runner.html"
    fi
    
    echo ""
    echo "💡 Tip: Install Python to run tests with a local server"
    echo "   This provides better testing environment and avoids CORS issues"
fi

echo ""
echo "🧪 Testing Suite Ready!"
echo "=========================="
