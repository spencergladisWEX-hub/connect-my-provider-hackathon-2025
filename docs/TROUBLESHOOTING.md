# Troubleshooting Guide

## Common Issues and Solutions

### 🚫 Server Startup Issues

#### Backend Won't Start

**Issue**: `python3 src/server.py` fails
```
ModuleNotFoundError: No module named 'flask'
```

**Solutions**:
```bash
# Install required packages
pip3 install -r requirements.txt

# Or install individually  
pip3 install Flask==2.3.3 Flask-CORS==4.0.0

# Check Python version (requires 3.9+)
python3 --version

# If python3 not found, try
python --version
```

#### Port Already in Use

**Issue**: 
```
OSError: [Errno 48] Address already in use
```

**Solutions**:
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill <PID>

# Or kill all python processes on port 4000
kill $(lsof -t -i:4000)

# Alternative: Change port in server.py
# Line 135: app.run(host='0.0.0.0', port=4001, debug=True)
```

#### Permission Issues

**Issue**: `./start_demo.sh: Permission denied`

**Solution**:
```bash
chmod +x start_demo.sh
```

### 🌐 Frontend Issues

#### Frontend Won't Load

**Issue**: Browser shows "This site can't be reached"

**Solutions**:
```bash
# Check if frontend server is running
curl http://localhost:3000

# Start frontend manually
cd wex-fsa-provider-substantiation-frontend
python3 -m http.server 3000

# Check for port conflicts
lsof -i :3000
```

#### CSS/JavaScript Not Loading

**Issue**: Page loads but styling/functionality broken

**Solutions**:
1. **Hard refresh**: Ctrl+F5 or Cmd+Shift+R
2. **Clear browser cache**
3. **Check browser console** for error messages
4. **Verify file paths** in index.html

### 🔗 API Connection Issues

#### "Backend not available" in Console

**Issue**: Frontend can't connect to backend API

**Solutions**:
```bash
# 1. Verify backend is running
curl http://localhost:4000/health

# 2. Check for CORS issues in browser console
# Should see successful OPTIONS requests

# 3. Verify API_BASE URL in frontend
# Look for: const API_BASE = 'http://localhost:4000';

# 4. Test direct API access
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Trellis Healthcare"}'
```

#### API Returns 500 Errors

**Issue**: Server errors in backend responses

**Solutions**:
1. **Check server logs** in terminal where backend is running
2. **Verify request format** matches expected JSON structure
3. **Restart backend server**
4. **Check for syntax errors** in server.py

### ⏱️ Timing Issues  

#### Connection Overlay Never Disappears

**Issue**: "Connecting to Provider..." stays on screen

**Solutions**:
```javascript
// 1. Check network tab for failed requests
// 2. Verify timing in JavaScript (should be 2 seconds)
// 3. Check for JavaScript errors in console

// 4. Manual fix: Open browser console and run:
document.getElementById('authOverlay').classList.add('hidden');
document.getElementById('successMessage').classList.remove('hidden');
```

#### Transaction Never Updates

**Issue**: Transaction stays "Pending" forever

**Solutions**:
```bash
# 1. Check EventSource connection
curl --no-buffer http://localhost:4000/events

# 2. Look for EventSource errors in browser console
# 3. Verify events endpoint in server.py

# 4. Manual update via console:
updateTransaction('TX-001', {
    status: 'Approved', 
    source: 'Verified by Provider'
});
```

### 🖥️ Browser-Specific Issues

#### Safari Issues
- **EventSource might not work**: Use Chrome or Firefox for testing
- **CORS preflight issues**: Ensure backend is running first

#### Internet Explorer/Old Edge
- **ES6 features not supported**: Use modern browser
- **Fetch API not available**: Upgrade browser

#### Mobile Browsers
- **Touch events**: Ensure buttons are large enough
- **Viewport scaling**: Check meta viewport tag

### 🔍 Network and Firewall Issues

#### Localhost Not Accessible

**Issue**: Can't access localhost URLs

**Solutions**:
```bash
# Try alternative addresses
http://127.0.0.1:3000
http://0.0.0.0:3000

# Check firewall settings
# On macOS: System Preferences > Security & Privacy > Firewall
# On Windows: Windows Defender Firewall settings

# Verify network interface
netstat -an | grep LISTEN
```

#### Corporate Network Issues

**Issue**: Blocked ports or proxy issues

**Solutions**:
- **Change ports** to common HTTP ports (8080, 8000)
- **Use different network** (mobile hotspot)
- **Check proxy settings** in browser
- **Contact IT department** for port unblocking

### 📊 Data Issues

#### Wrong Transaction Data

**Issue**: Incorrect amounts, dates, or provider names

**Solution**: Edit mock data in server.py:
```python
# Lines 51-103: Mock transaction data
mock_transaction = {
    'id': transaction_id,
    'provider': 'Your Provider Name',  # Change here
    'dateOfService': '2024-12-01',     # Change here
    'patientResponsibility': 50.00,    # Change here
    # ... rest of data
}
```

#### FHIR Data Malformed

**Issue**: Invalid FHIR structure

**Solutions**:
1. **Validate against FHIR spec**: https://www.hl7.org/fhir/explanationofbenefit.html
2. **Use FHIR validator tools**
3. **Check required fields** are present
4. **Verify coding systems** are correct

### 🧪 Testing Issues

#### Demo Flow Doesn't Work

**Issue**: Complete flow fails at some step

**Systematic Debug**:
```bash
# 1. Test individual components
curl http://localhost:4000/health              # Backend up?
curl http://localhost:3000                     # Frontend up?

# 2. Test API endpoints separately  
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Test"}'

curl http://localhost:4000/transaction-status/TX-001

# 3. Check browser console for errors
# 4. Check network tab for failed requests
# 5. Verify timing (2 seconds + 3 seconds)
```

#### Multiple Browser Testing

**Issue**: Works in one browser but not another

**Solutions**:
1. **Check browser compatibility** requirements
2. **Test in incognito/private mode**
3. **Clear browser data** for affected browser
4. **Check for browser extensions** interfering

## 🛠️ Advanced Debugging

### Enable Debug Mode

#### Backend Debugging
```python
# server.py line 135 - Debug mode is already enabled
app.run(host='0.0.0.0', port=4000, debug=True)

# Add extra logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### Frontend Debugging
```javascript
// Add to index.html for verbose logging
console.log('API_BASE:', API_BASE);

// Log all API calls
fetch(url).then(response => {
    console.log('Response:', response.status, response);
    return response.json();
});
```

### Performance Issues

#### Slow Response Times
```bash
# Check system resources
top
htop

# Test network latency
ping localhost

# Profile Python code
python3 -m cProfile src/server.py
```

#### Memory Issues
```bash
# Monitor memory usage
ps aux | grep python

# Check for memory leaks
# Restart servers periodically during development
```

## 📞 Getting Help

### Information to Collect
When reporting issues, include:

1. **System Information**:
   - Operating system and version
   - Python version (`python3 --version`)
   - Browser and version

2. **Error Messages**:
   - Complete error messages from terminal
   - Browser console errors
   - Network tab information

3. **Steps to Reproduce**:
   - Exact commands run
   - Order of operations
   - What was expected vs. what happened

4. **Environment Details**:
   - Port configurations
   - Network setup
   - Firewall/antivirus software

### Useful Commands for Diagnosis
```bash
# System info
python3 --version
which python3
curl --version

# Network info
netstat -an | grep LISTEN
lsof -i :3000
lsof -i :4000

# Process info
ps aux | grep python
ps aux | grep http.server

# File permissions
ls -la start_demo.sh
ls -la wex-fsa-provider-substantiation-backend/src/server.py
```

---

*If you can't resolve an issue with this guide, please create an issue with detailed information.*