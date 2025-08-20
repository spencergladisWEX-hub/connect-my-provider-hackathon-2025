#!/bin/bash

echo "🔍 WEX Benefits Portal - System Status Check"
echo "=============================================="
echo ""

# Check backend server
echo "📡 Backend Server (Port 4000):"
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "   ✅ Running - http://localhost:4000"
    echo "   📊 Health Status:"
    curl -s http://localhost:4000/health | python3 -m json.tool 2>/dev/null || echo "   ⚠️  Health endpoint accessible but JSON parsing failed"
else
    echo "   ❌ Not responding - http://localhost:4000"
fi
echo ""

# Check frontend server
echo "🌐 Frontend Server (Port 3000):"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ Running - http://localhost:3000"
    
    # Check main app
    if curl -s http://localhost:3000 | grep -q "wex BENEFITS"; then
        echo "   ✅ Main application accessible"
    else
        echo "   ⚠️  Main application not responding correctly"
    fi
    
    # Check test page
    if curl -s http://localhost:3000/test-modal-system.html | grep -q "Modal System Test"; then
        echo "   ✅ Test page accessible"
    else
        echo "   ⚠️  Test page not accessible"
    fi
else
    echo "   ❌ Not responding - http://localhost:3000"
fi
echo ""

# Check if processes are running
echo "🔄 Process Status:"
echo "   Backend Python process:"
if pgrep -f "python3 server.py" > /dev/null; then
    echo "   ✅ Running (PID: $(pgrep -f 'python3 server.py'))"
else
    echo "   ❌ Not running"
fi

echo "   Frontend HTTP server:"
if pgrep -f "python3 -m http.server 3000" > /dev/null; then
    echo "   ✅ Running (PID: $(pgrep -f 'python3 -m http.server 3000'))"
else
    echo "   ❌ Not running"
fi
echo ""

# Check ports
echo "🔌 Port Status:"
echo "   Port 4000 (Backend):"
if netstat -an | grep -q ":4000.*LISTEN"; then
    echo "   ✅ Listening"
else
    echo "   ❌ Not listening"
fi

echo "   Port 3000 (Frontend):"
if netstat -an | grep -q ":3000.*LISTEN"; then
    echo "   ✅ Listening"
else
    echo "   ❌ Not listening"
fi
echo ""

echo "🎯 Testing Instructions:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Click 'Connect My Provider' button"
echo "   3. Test the modal workflow: Terms → Auth → Progress → Success"
echo "   4. If issues occur, check browser console for errors"
echo "   5. Test page: http://localhost:3000/test-modal-system.html"
echo ""

echo "🔧 Troubleshooting:"
echo "   - If modals don't work, check browser console for JavaScript errors"
echo "   - If backend fails, check Python dependencies and .env file"
echo "   - If frontend fails, ensure all JavaScript files are accessible"
echo ""

echo "✅ System status check complete!"
