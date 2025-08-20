#!/bin/bash

echo "🔍 VS Code SSO SAML Diagnostic Tool"
echo "====================================="
echo ""

# Check VS Code installation
echo "📋 VS Code Installation Status:"
if command -v code &> /dev/null; then
    echo "✅ VS Code is installed"
    code --version
else
    echo "❌ VS Code is not installed or not in PATH"
    exit 1
fi
echo ""

# Check VS Code settings
echo "⚙️ VS Code Settings:"
VSCODE_SETTINGS="$HOME/Library/Application Support/Code/User/settings.json"
if [ -f "$VSCODE_SETTINGS" ]; then
    echo "✅ Settings file found: $VSCODE_SETTINGS"
    echo "Current proxy settings:"
    grep -i "proxy" "$VSCODE_SETTINGS" || echo "No proxy settings found"
else
    echo "❌ Settings file not found: $VSCODE_SETTINGS"
fi
echo ""

# Check network connectivity
echo "🌐 Network Connectivity:"
echo "Testing basic connectivity..."
if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "✅ Basic internet connectivity OK"
else
    echo "❌ Basic internet connectivity failed"
fi

if ping -c 1 google.com &> /dev/null; then
    echo "✅ DNS resolution OK"
else
    echo "❌ DNS resolution failed"
fi

# Test Microsoft authentication endpoints
echo "Testing Microsoft authentication endpoints..."
if curl -s --connect-timeout 10 https://login.microsoftonline.com &> /dev/null; then
    echo "✅ Microsoft login endpoint accessible"
else
    echo "❌ Microsoft login endpoint not accessible"
fi

if curl -s --connect-timeout 10 https://marketplace.visualstudio.com &> /dev/null; then
    echo "✅ VS Code marketplace accessible"
else
    echo "❌ VS Code marketplace not accessible"
fi
echo ""

# Check proxy environment variables
echo "🔧 Proxy Configuration:"
if [ -n "$http_proxy" ]; then
    echo "✅ HTTP_PROXY set: $http_proxy"
else
    echo "ℹ️ HTTP_PROXY not set"
fi

if [ -n "$https_proxy" ]; then
    echo "✅ HTTPS_PROXY set: $https_proxy"
else
    echo "ℹ️ HTTPS_PROXY not set"
fi

if [ -n "$no_proxy" ]; then
    echo "✅ NO_PROXY set: $no_proxy"
else
    echo "ℹ️ NO_PROXY not set"
fi
echo ""

# Check VS Code authentication cache
echo "🗂️ VS Code Authentication Cache:"
VSCODE_CACHE="$HOME/Library/Application Support/Code/User/globalStorage/ms-vscode.vscode-json"
if [ -d "$(dirname "$VSCODE_CACHE")" ]; then
    echo "✅ VS Code global storage directory exists"
    ls -la "$(dirname "$VSCODE_CACHE")" | grep -E "(ms-vscode|authentication)" || echo "No authentication-related storage found"
else
    echo "❌ VS Code global storage directory not found"
fi
echo ""

# Check system keychain for certificates
echo "🔐 System Certificates:"
if security list-keychains | grep -q "login.keychain"; then
    echo "✅ Login keychain accessible"
    echo "Trusted certificates:"
    security find-certificate -a -p login.keychain | grep -c "BEGIN CERTIFICATE" | xargs echo "Found certificates:"
else
    echo "❌ Login keychain not accessible"
fi
echo ""

# Check for corporate network indicators
echo "🏢 Corporate Network Detection:"
if [ -f "/etc/resolv.conf" ]; then
    echo "DNS servers:"
    grep "nameserver" /etc/resolv.conf
fi

# Check if running on corporate network
if hostname | grep -qi "corp\|company\|enterprise"; then
    echo "✅ Running on corporate network (based on hostname)"
elif [ -n "$http_proxy" ] || [ -n "$https_proxy" ]; then
    echo "✅ Running behind corporate proxy"
else
    echo "ℹ️ No obvious corporate network indicators"
fi
echo ""

# Recommendations
echo "💡 Recommendations:"
echo "1. If you see proxy settings, ensure they're correct for your network"
echo "2. If authentication cache exists, try clearing it:"
echo "   rm -rf ~/Library/Application\ Support/Code/User/globalStorage/ms-vscode.vscode-json"
echo "3. If behind corporate firewall, contact IT for proper proxy configuration"
echo "4. Test authentication in browser first to isolate VS Code-specific issues"
echo ""

echo "🔍 Diagnostic complete. Check the troubleshooting guide for solutions."
