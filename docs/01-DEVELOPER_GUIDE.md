# Developer Guide

## 🛠️ Development Environment Setup

### Prerequisites
- **Python 3.9+** (required)
- **Git** for version control
- **Modern web browser** for testing
- **Text editor/IDE** of choice

### Quick Setup
```bash
# Clone and navigate to project
git clone <repository-url>
cd SHARE

# Run the demo
./start_demo.sh
```

## 🏗️ Project Architecture

### Directory Structure
```
SHARE/
├── wex-fsa-provider-substantiation-backend/
│   ├── requirements.txt        # Python dependencies
│   └── src/
│       └── server.py          # Flask API server
├── wex-fsa-provider-substantiation-frontend/
│   └── index.html             # Single-page application
├── docs/                      # Documentation (this directory)
├── start_demo.sh             # Quick start script
└── README.md                 # Main project documentation
```

### Technology Stack
- **Backend**: Python 3.9+ with Flask 2.3.3, Flask-CORS 4.0.0
- **Frontend**: Vanilla HTML/CSS/JavaScript (ES6+)
- **Data Format**: FHIR R4 ExplanationOfBenefit resources
- **Communication**: REST API + Server-Sent Events (SSE)

## 🔧 Development Workflow

### Running Individual Components

#### Backend Server
```bash
cd wex-fsa-provider-substantiation-backend
pip3 install -r requirements.txt
python3 src/server.py
# Server runs on http://localhost:4000
```

#### Frontend Server
```bash
cd wex-fsa-provider-substantiation-frontend
python3 -m http.server 3000
# Frontend runs on http://localhost:3000
```

### Code Style Guidelines

#### Python (Backend)
- Follow PEP 8 style guidelines
- Use descriptive function and variable names
- Add docstrings for all functions
- Handle errors gracefully with appropriate HTTP status codes

#### JavaScript (Frontend)
- Use modern ES6+ features
- Prefer `const`/`let` over `var`
- Use async/await for asynchronous operations
- Add meaningful comments for complex logic

#### HTML/CSS (Frontend)
- Use semantic HTML elements
- Follow responsive design principles
- Keep CSS organized with logical grouping
- Use CSS custom properties for theming

## 🧪 Testing

### Manual Testing
1. Start both servers using `./start_demo.sh`
2. Navigate to http://localhost:3000
3. Test the complete flow:
   - Click "Connect My Provider"
   - Verify 2-second loading state
   - Confirm successful connection message
   - Wait for transaction to appear
   - Observe auto-approval after 3 seconds

### API Testing
```bash
# Health check
curl http://localhost:4000/health

# Link account (simulates 2-second delay)
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Trellis Healthcare"}'

# Get transaction with FHIR data
curl http://localhost:4000/transaction-status/TX-001

# Test Server-Sent Events (requires curl with --no-buffer)
curl --no-buffer http://localhost:4000/events
```

## 🤝 Contributing

### Making Changes
1. Create a feature branch from `main`
2. Make your changes following the style guidelines
3. Test your changes manually
4. Update documentation if needed
5. Submit a pull request

### Adding New Features

#### Backend Features
1. Add new routes to `src/server.py`
2. Follow the existing pattern for error handling
3. Update mock data if necessary
4. Document new endpoints in API reference

#### Frontend Features
1. Add new functions to the existing JavaScript
2. Maintain the existing UI/UX patterns
3. Ensure responsive design
4. Test across different browsers

### Documentation Updates
- Keep documentation in sync with code changes
- Update API examples when endpoints change
- Add new sections to developer guide as needed
- Follow the established markdown formatting

## 🐛 Debugging

### Common Development Issues

#### Backend Issues
- **Port 4000 already in use**: Kill existing process or change port
- **Import errors**: Ensure requirements.txt dependencies are installed
- **CORS errors**: Verify Flask-CORS is properly configured

#### Frontend Issues
- **API connection fails**: Ensure backend is running on port 4000
- **Events not working**: Check browser console for EventSource errors
- **Styling issues**: Verify CSS syntax and browser compatibility

### Logging
- Backend uses Flask's built-in logging
- Frontend uses browser console for debugging
- Check both console outputs when troubleshooting

## 🚀 Next Steps

### Potential Enhancements
1. **Real Epic FHIR Integration**
   - Implement OAuth2 authentication
   - Connect to actual FHIR endpoints
   - Handle real patient data securely

2. **Enhanced UI/UX**
   - Add data visualization
   - Implement user preferences
   - Mobile app development

3. **Production Features**
   - Database integration
   - User authentication
   - Rate limiting and security

---
*For additional help, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or create an issue.*