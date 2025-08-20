# VS Code SSO SAML Troubleshooting Guide

## 🔍 **Common VS Code SSO SAML Issues & Solutions**

### **1. Authentication Loop Issues**

**Symptoms:**
- VS Code keeps redirecting to login page
- "Sign in to continue" appears repeatedly
- Browser opens but authentication doesn't complete

**Solutions:**
```bash
# Clear VS Code authentication cache
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/ms-vscode.vscode-json
rm -rf ~/Library/Application\ Support/Code/User/workspaceStorage/*/ms-vscode.vscode-json

# Clear browser cookies for your SSO domain
# Check Chrome/Edge settings for your organization's SSO domain
```

### **2. SAML Configuration Issues**

**Symptoms:**
- "SAML authentication failed" errors
- Cannot reach identity provider
- Certificate validation errors

**Solutions:**
```json
// settings.json configuration
{
    "http.proxy": "http://your-proxy:port",
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on"
}
```

### **3. Network/Proxy Issues**

**Symptoms:**
- "Network error" during authentication
- Cannot reach login.microsoftonline.com
- Timeout errors

**Solutions:**
```bash
# Check network connectivity
ping login.microsoftonline.com
nslookup login.microsoftonline.com

# Test with curl
curl -v https://login.microsoftonline.com

# Configure proxy if needed
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

### **4. Certificate/SSL Issues**

**Symptoms:**
- "Certificate not trusted" errors
- SSL handshake failures
- Security warnings

**Solutions:**
```bash
# Install corporate root certificates
# Copy certificates to system keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain corporate-ca.crt

# Or add to VS Code settings
{
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on"
}
```

### **5. VS Code Extension Issues**

**Symptoms:**
- Authentication extension not working
- "Extension host terminated" errors
- Cannot install extensions

**Solutions:**
```bash
# Reset VS Code extensions
rm -rf ~/.vscode/extensions
rm -rf ~/Library/Application\ Support/Code/User/extensions

# Reinstall VS Code completely
# Download fresh copy from https://code.visualstudio.com/
```

## 🛠️ **Step-by-Step Troubleshooting Process**

### **Step 1: Check Current Status**
```bash
# Check VS Code version
code --version

# Check if running in corporate environment
echo $http_proxy
echo $https_proxy
echo $no_proxy
```

### **Step 2: Verify Network Configuration**
```bash
# Test basic connectivity
ping 8.8.8.8
ping google.com

# Test corporate SSO endpoints
ping your-company-sso.com
curl -v https://your-company-sso.com
```

### **Step 3: Check VS Code Settings**
```json
// ~/Library/Application Support/Code/User/settings.json
{
    "http.proxy": "http://your-proxy:port",
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on",
    "http.proxyAuthorization": "Basic base64-encoded-credentials",
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on"
}
```

### **Step 4: Browser Authentication Test**
1. Open browser in incognito/private mode
2. Navigate to your SSO login page
3. Complete authentication manually
4. Check if you can access VS Code marketplace

### **Step 5: Reset VS Code Authentication**
```bash
# Close VS Code completely
# Clear authentication data
rm -rf ~/Library/Application\ Support/Code/User/globalStorage/ms-vscode.vscode-json
rm -rf ~/Library/Application\ Support/Code/User/workspaceStorage/*/ms-vscode.vscode-json

# Restart VS Code
code .
```

## 🔧 **Advanced Solutions**

### **Corporate Firewall Bypass**
```bash
# Use corporate VPN if available
# Configure proxy settings in system preferences
# Check with IT for specific network requirements
```

### **Custom SAML Configuration**
```json
// If your organization uses custom SAML endpoints
{
    "http.proxy": "http://your-saml-proxy:port",
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on"
}
```

### **Environment-Specific Settings**
```bash
# Create organization-specific VS Code settings
mkdir -p ~/.vscode
cat > ~/.vscode/settings.json << EOF
{
    "http.proxy": "http://your-org-proxy:port",
    "http.proxyStrictSSL": false,
    "http.proxySupport": "on"
}
EOF
```

## 📋 **Checklist for IT Support**

When contacting IT support, provide:

- [ ] VS Code version (`code --version`)
- [ ] Operating system version
- [ ] Network configuration (proxy settings)
- [ ] Error messages and screenshots
- [ ] Steps to reproduce the issue
- [ ] Whether the issue occurs in browser
- [ ] Corporate VPN status
- [ ] Firewall/security software details

## 🚨 **Emergency Workarounds**

### **Offline Mode**
```bash
# Install extensions manually
# Download .vsix files from https://marketplace.visualstudio.com/
# Install with: code --install-extension extension-name.vsix
```

### **Alternative Authentication**
- Use personal Microsoft account temporarily
- Use GitHub authentication if available
- Contact IT for temporary access

## 📞 **Getting Help**

1. **Check VS Code documentation**: https://code.visualstudio.com/docs/setup/network
2. **VS Code GitHub issues**: https://github.com/microsoft/vscode/issues
3. **Contact your IT department** with the checklist above
4. **Microsoft support**: https://support.microsoft.com/

## 🔄 **Prevention Tips**

- Keep VS Code updated to latest version
- Use corporate VPN when working remotely
- Regularly clear authentication cache
- Document working configuration for your environment
- Test authentication after network changes
