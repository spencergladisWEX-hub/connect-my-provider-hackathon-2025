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
├── docs/                            # Complete documentation
│   ├── 00-INDEX.md                 # Documentation index
│   ├── 01-DEVELOPER_GUIDE.md       # Development guide
│   ├── 02-API_REFERENCE.md         # API documentation
│   ├── 03-FHIR_COMPLIANCE.md       # FHIR implementation
│   ├── 04-SECURITY.md              # Security considerations
│   ├── 05-TESTING.md               # Testing strategies
│   ├── QUICK_REFERENCE.md          # Quick commands & URLs
│   ├── TROUBLESHOOTING.md          # Common issues & solutions
│   ├── ARCHITECTURE.md             # System architecture
│   └── DEPLOYMENT.md               # Deployment guide
├── wex-fsa-provider-substantiation-backend/
│   ├── requirements.txt             # Python dependencies
│   └── src/
│       └── server.py               # Flask API server
└── wex-fsa-provider-substantiation-frontend/
    └── index.html                  # Frontend application
```

## 📚 Documentation

For comprehensive information about this project, see the complete documentation in the [`docs/`](docs/) directory:

- **[Developer Guide](docs/01-DEVELOPER_GUIDE.md)** - Setup, development, and contribution guide
- **[API Reference](docs/02-API_REFERENCE.md)** - Complete API documentation
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Commands, URLs, and common tasks
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🛠️ Development

### Quick Development Tasks
- **Adding endpoints**: See [Developer Guide](docs/01-DEVELOPER_GUIDE.md#adding-new-features)
- **Modifying UI**: See [Developer Guide](docs/01-DEVELOPER_GUIDE.md#frontend-features)
- **Testing**: See [Testing Guide](docs/05-TESTING.md)
- **Security**: See [Security Considerations](docs/04-SECURITY.md)

## 🎉 Success!

You now have a fully functional demo of provider-verified substantiation that showcases:
- Zero-touch user experience
- Real-time updates
- Provider integration concept
- FHIR EOB data processing

Perfect for hackathon demos and stakeholder presentations!
