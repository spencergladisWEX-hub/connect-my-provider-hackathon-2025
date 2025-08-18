# WEX FSA Provider Substantiation Demo

A working demo of provider-verified substantiation for FSA consumer portal, featuring zero-touch approval with real-time updates.

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ (already installed on your system)
- Modern web browser

### Run the Demo
```bash
./start_demo.sh
```

This will:
1. Install Python dependencies
2. Start the backend API server (port 4000)
3. Start the frontend web server (port 3000)
4. Open your browser to http://localhost:3000

## 🎬 Demo Flow

1. **Click "Connect My Provider"** - Initiates the provider connection flow
2. **Authentication Overlay** - Shows "Connecting to Provider..." (2 seconds)
3. **Success Message** - Confirms connection to Trellis Healthcare
4. **Transaction Appears** - Shows pending transaction from Downtown Dental Associates
5. **Auto-Approval** - Transaction automatically updates to "Approved (Verified by Provider)" (3 seconds)

## 🏗️ Architecture

### Backend (Python Flask)
- **Port**: 4000
- **Endpoints**:
  - `GET /health` - Health check
  - `POST /link-account` - Mock provider authentication
  - `GET /transaction-status/:id` - Get transaction with FHIR EOB data
  - `GET /events` - Server-Sent Events for real-time updates

### Frontend (HTML/JavaScript)
- **Port**: 3000
- **Features**:
  - Modern, responsive UI
  - Real-time transaction updates
  - Provider authentication simulation
  - Status-based styling

### Mock Data
- **Provider**: Trellis Healthcare (Maine-based Epic client)
- **Transaction**: Downtown Dental Associates
- **Service**: Adult Dental Prophylaxis
- **Amount**: $30.00 patient responsibility
- **FHIR EOB**: Complete ExplanationOfBenefit structure

## 🔧 Manual Setup (Alternative)

If you prefer to run servers manually:

### Backend
```bash
cd wex-fsa-provider-substantiation-backend
pip3 install -r requirements.txt
python3 src/server.py
```

### Frontend
```bash
cd wex-fsa-provider-substantiation-frontend
python3 -m http.server 3000
```

## 📊 API Testing

Test the backend endpoints:

```bash
# Health check
curl http://localhost:4000/health

# Link account
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Trellis Healthcare"}'

# Get transaction status
curl http://localhost:4000/transaction-status/TX-001
```

## 🎯 Key Features

### Zero-Touch Experience
- No manual substantiation required
- Automatic provider verification
- Real-time status updates

### Provider Integration
- Mock Epic FHIR integration
- Realistic authentication flow
- FHIR EOB data processing

### User Experience
- Smooth transitions
- Loading states
- Error handling
- Success feedback

## 🔮 Future Enhancements

### Epic FHIR Integration
- Real OAuth2 authentication
- Live EOB data retrieval
- Multiple provider support

### Payment Processing
- Direct-to-provider payments
- Real-time balance information
- Automated claim filing

### AI/ML Features
- Appointment-based predictions
- HSA optimization recommendations
- Fraud detection

## 📁 Project Structure

```
SHARE/
├── start_demo.sh                    # Demo startup script
├── README.md                        # This file
├── wex-fsa-provider-substantiation-backend/
│   ├── requirements.txt             # Python dependencies
│   └── src/
│       └── server.py               # Flask API server
└── wex-fsa-provider-substantiation-frontend/
    └── index.html                  # Frontend application
```

## 🛠️ Development

### Adding New Endpoints
1. Add route to `src/server.py`
2. Update mock data as needed
3. Test with curl or browser

### Modifying UI
1. Edit `index.html`
2. Update CSS styles
3. Modify JavaScript functions

### Changing Mock Data
1. Update transaction data in `server.py`
2. Modify FHIR EOB structure
3. Adjust timing in event endpoints

## 🎉 Success!

You now have a fully functional demo of provider-verified substantiation that showcases:
- Zero-touch user experience
- Real-time updates
- Provider integration concept
- FHIR EOB data processing

Perfect for hackathon demos and stakeholder presentations!
