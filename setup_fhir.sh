#!/bin/bash

echo "🚀 Setting up WEX FSA FHIR Integration..."
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "📦 Installing Python dependencies..."
cd backend
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python dependencies installed successfully"
echo ""

echo "🔧 Configuration Setup"
echo "======================"
echo ""
echo "To complete the setup, you need to:"
echo ""
echo "1. Register your app on Epic on FHIR:"
echo "   - Go to https://fhir.epic.com/"
echo "   - Create a new app with 'Patients' user context"
echo "   - Select the recommended APIs (Patient, Coverage, ExplanationOfBenefit, etc.)"
echo "   - Get your Client ID"
echo ""
echo "2. Set up environment variables:"
echo "   - Copy backend/env_template.txt to backend/.env"
echo "   - Replace 'your-client-id-here' with your actual Epic Client ID"
echo ""
echo "3. Test the integration:"
echo "   - Run: ./start_demo.sh"
echo "   - Visit: http://localhost:3000/dashboard.html"
echo "   - Click 'Connect Epic Provider' to test OAuth flow"
echo ""
echo "📋 Test Credentials:"
echo "   - Patient: fhircamila / epicepic1"
echo "   - Provider: FHIRTWO / EpicFhir11!"
echo ""
echo "🎯 Next Steps:"
echo "   1. Complete Epic app registration"
echo "   2. Set EPIC_CLIENT_ID in environment"
echo "   3. Test OAuth flow with sandbox"
echo "   4. Verify expense tracker functionality"
echo ""
echo "✅ Setup script completed!"
echo ""
