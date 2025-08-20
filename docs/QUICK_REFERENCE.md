# Quick Reference

## 🚀 Getting Started Commands

### Start Demo
```bash
./start_demo.sh
```

### Manual Server Startup
```bash
# Backend (Terminal 1)
cd wex-fsa-provider-substantiation-backend
pip3 install -r requirements.txt
python3 src/server.py

# Frontend (Terminal 2) 
cd wex-fsa-provider-substantiation-frontend
python3 -m http.server 3000
```

### Stop Servers
```bash
# Find and kill processes
ps aux | grep python3
kill <pid>

# Or use Ctrl+C in terminal windows
```

## 🔗 Quick Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Main demo application |
| Backend API | http://localhost:4000 | REST API server |
| Health Check | http://localhost:4000/health | API health status |

## 📡 API Endpoints

### Core Endpoints
```bash
# Health Check
curl http://localhost:4000/health

# Link Provider Account (2-second delay)
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Trellis Healthcare"}'

# Get Transaction with FHIR Data
curl http://localhost:4000/transaction-status/TX-001

# Server-Sent Events (real-time updates)
curl --no-buffer http://localhost:4000/events
```

## 🎬 Demo Flow Checklist

### User Actions
- [ ] Open http://localhost:3000
- [ ] Click "Connect My Provider" 
- [ ] Wait for "Connecting to Provider..." overlay (2 seconds)
- [ ] See "Successfully connected to Trellis Healthcare" message
- [ ] Observe transaction appear as "Pending"
- [ ] Watch auto-approval after 3 seconds
- [ ] Verify status: "Approved (Verified by Provider)"

### Expected Timings
- Connection overlay: 2 seconds
- Transaction auto-approval: 3 seconds after connection
- Total demo flow: ~5-6 seconds

## 🛠️ Development Shortcuts

### File Locations
```
Backend:
- Server: wex-fsa-provider-substantiation-backend/src/server.py
- Dependencies: wex-fsa-provider-substantiation-backend/requirements.txt

Frontend:
- App: wex-fsa-provider-substantiation-frontend/index.html

Documentation:
- All docs: docs/
- Main README: README.md
```

### Common Changes
```python
# Change API port (server.py line 135)
app.run(host='0.0.0.0', port=4000, debug=True)

# Change mock provider (server.py line 37)
'provider': 'Your Provider Name'

# Change transaction amount (server.py line 55)
'patientResponsibility': 30.00

# Change auto-approval delay (server.py line 113)
time.sleep(3)  # seconds
```

```javascript
// Change frontend API URL (index.html)
const API_BASE = 'http://localhost:4000';

// Change connection overlay timing (index.html)
setTimeout(() => {
    // ... connection logic
}, 2000); // milliseconds
```

## 🔍 Debugging Commands

### Check if servers are running
```bash
# Check backend
curl http://localhost:4000/health

# Check frontend
curl http://localhost:3000

# Check process status
lsof -i :3000
lsof -i :4000
```

### View logs
```bash
# Backend logs (in terminal where server.py is running)
# Frontend logs (browser console)
# Network logs (browser dev tools Network tab)
```

### Common Issues
```bash
# Port already in use
kill $(lsof -t -i:4000)  # Kill backend
kill $(lsof -t -i:3000)  # Kill frontend

# Permission denied
chmod +x start_demo.sh

# Python not found
python3 --version
which python3
```

## 📊 Mock Data Reference

### Transaction Data
```json
{
  "id": "TX-001",
  "provider": "Downtown Dental Associates", 
  "dateOfService": "2025-08-19",
  "patientResponsibility": 30.00,
  "currency": "USD",
  "status": "Pending" → "Approved",
  "source": "Pending Verification" → "Verified by Provider"
}
```

### FHIR EOB Key Fields
```json
{
  "resourceType": "ExplanationOfBenefit",
  "id": "EOB-DENTAL-12345",
  "type.coding[0].code": "oral",
  "patient.display": "John Appleseed",
  "provider.display": "Downtown Dental Associates",
  "item[0].productOrService.coding[0].code": "D1110",
  "item[0].productOrService.display": "Adult Dental Prophylaxis"
}
```

### Provider Information
```json
{
  "name": "Trellis Healthcare",
  "location": "Maine",
  "system": "Epic",
  "connection_time": "2 seconds",
  "linkId": "LINK-001"
}
```

## 🧪 Testing Commands

### Manual API Testing
```bash
# Test complete flow
curl http://localhost:4000/health
curl -X POST http://localhost:4000/link-account -H "Content-Type: application/json" -d '{"provider":"Trellis Healthcare"}'
curl http://localhost:4000/transaction-status/TX-001

# Test error conditions
curl http://localhost:4000/transaction-status/INVALID-ID
curl -X POST http://localhost:4000/link-account -H "Content-Type: application/json" -d '{invalid json}'
```

### Browser Testing
1. Open Developer Tools (F12)
2. Go to Network tab
3. Run demo flow
4. Check for any failed requests
5. Verify Server-Sent Events in EventStream

## 🎯 Key Metrics

### Performance Expectations
- Health check response: < 100ms
- Account linking: ~2 seconds (intentional delay)
- Transaction retrieval: < 200ms
- Event delivery: ~3 seconds after linking

### Success Criteria
- ✅ All API endpoints return 200 status
- ✅ Frontend loads without errors
- ✅ Connection flow completes successfully
- ✅ Transaction updates in real-time
- ✅ No console errors in browser

---

*For detailed information, see the full documentation in the [docs/](/) directory.*