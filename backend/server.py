from flask import Flask, jsonify, request, Response, session, redirect, url_for
from flask_cors import CORS
import json
import time
import threading
import os

# Import our new modules
from config import EPIC_CONFIG, TEST_PATIENTS, TEST_USERS
from oauth_handler import EpicOAuthHandler
from fhir_client import EpicFHIRClient
from transformers import transform_eobs_to_expenses, transform_patient_data

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure session
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Initialize OAuth handler
oauth_handler = EpicOAuthHandler(EPIC_CONFIG)

# Mock data store (for demo fallback)
mock_state = {
    'link_status': 'idle',
    'transactions': [],
    'current_user': None
}

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'service': 'WEX FSA Provider Substantiation API',
        'fhir_integration': 'enabled',
        'epic_sandbox': 'configured'
    })

@app.route('/auth/epic', methods=['GET'])
def epic_auth():
    """Initiate Epic OAuth flow"""
    try:
        # Generate state for CSRF protection
        state = oauth_handler.generate_state()
        session['oauth_state'] = state
        
        # Generate authorization URL
        auth_url = oauth_handler.get_authorization_url(state)
        
        print(f"🔐 Initiating Epic OAuth flow with state: {state}")
        return redirect(auth_url)
        
    except Exception as e:
        print(f"❌ OAuth initiation failed: {e}")
        return jsonify({'error': 'OAuth initiation failed'}), 500

@app.route('/auth/callback', methods=['GET'])
def auth_callback():
    """Handle OAuth callback from Epic"""
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        print(f"🔐 OAuth callback received - code: {code[:10]}..., state: {state}")
        
        if error:
            print(f"❌ OAuth error: {error}")
            return jsonify({'error': f'OAuth error: {error}'}), 400
        
        if not code or not state:
            return jsonify({'error': 'Missing code or state parameter'}), 400
        
        # Validate state parameter
        if state != session.get('oauth_state'):
            print(f"❌ State mismatch: {state} != {session.get('oauth_state')}")
            return jsonify({'error': 'Invalid state parameter'}), 400
        
        # Exchange code for token
        token_response = oauth_handler.exchange_code_for_token(code)
        
        if 'error' in token_response:
            print(f"❌ Token exchange failed: {token_response['error']}")
            return jsonify({'error': 'Token exchange failed'}), 500
        
        if not oauth_handler.validate_token_response(token_response):
            print(f"❌ Invalid token response: {token_response}")
            return jsonify({'error': 'Invalid token response'}), 500
        
        # Store token info in session
        token_info = oauth_handler.get_token_info(token_response)
        session['access_token'] = token_info['access_token']
        session['patient_id'] = token_info['patient_id']
        session['token_expires'] = time.time() + token_info['expires_in']
        
        print(f"✅ OAuth successful - Patient ID: {token_info['patient_id']}")
        
        # Redirect to frontend with success
        return redirect('http://localhost:3000/dashboard')
        
    except Exception as e:
        print(f"❌ OAuth callback error: {e}")
        return jsonify({'error': 'OAuth callback failed'}), 500

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Generate expense tracker from FHIR data"""
    try:
        # Check if user is authenticated
        access_token = session.get('access_token')
        patient_id = session.get('patient_id')
        
        if not access_token or not patient_id:
            print("❌ User not authenticated")
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Check if token is expired
        if time.time() > session.get('token_expires', 0):
            print("❌ Token expired")
            session.clear()
            return jsonify({'error': 'Token expired'}), 401
        
        print(f"🔍 Fetching expenses for patient: {patient_id}")
        
        # Initialize FHIR client
        fhir_client = EpicFHIRClient(EPIC_CONFIG['fhir_base_url'], access_token)
        
        # Fetch FHIR data
        patient = fhir_client.get_patient(patient_id)
        if 'error' in patient:
            print(f"❌ Failed to fetch patient: {patient['error']}")
            return jsonify({'error': 'Failed to fetch patient data'}), 500
        
        eobs = fhir_client.get_explanation_of_benefits(patient_id)
        coverage = fhir_client.get_coverage(patient_id)
        observations = fhir_client.get_observations(patient_id)
        procedures = fhir_client.get_procedures(patient_id)
        medications = fhir_client.get_medication_requests(patient_id)
        conditions = fhir_client.get_conditions(patient_id)
        
        # Transform data
        expenses = transform_eobs_to_expenses(eobs, patient)
        patient_info = transform_patient_data(patient)
        
        print(f"✅ Successfully fetched {len(expenses)} expenses")
        
        return jsonify({
            'patient': patient_info,
            'expenses': expenses,
            'coverage': coverage,
            'observations': observations,
            'procedures': procedures,
            'medications': medications,
            'conditions': conditions,
            'fhir_patient_id': patient_id
        })
        
    except Exception as e:
        print(f"❌ Error fetching expenses: {e}")
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@app.route('/api/test-patients', methods=['GET'])
def get_test_patients():
    """Get available test patients for demo"""
    return jsonify({
        'test_patients': TEST_PATIENTS,
        'test_users': TEST_USERS
    })

@app.route('/api/mock-expenses', methods=['GET'])
def get_mock_expenses():
    """Fallback to mock data if FHIR integration fails"""
    print("🔄 Using mock data fallback")
    
    mock_expenses = [
        {
            'id': 'EOB-DENTAL-12345',
            'date': '2025-08-19',
            'provider': 'Downtown Dental Associates',
            'service': 'Adult Dental Prophylaxis',
            'amount': 30.00,
            'status': 'Approved',
            'category': 'Dental',
            'currency': 'USD',
            'patient_name': 'John Appleseed'
        }
    ]
    
    return jsonify({
        'patient': {
            'name': 'John Appleseed',
            'id': 'mock-patient-001'
        },
        'expenses': mock_expenses,
        'source': 'mock_data'
    })

@app.route('/link-account', methods=['POST'])
def link_account():
    """Mock provider account linking (legacy endpoint)"""
    print("Link account request received")
    
    # Simulate 2-second processing time
    time.sleep(2)
    
    mock_state['link_status'] = 'linked'
    mock_state['current_user'] = {
        'id': 'USER-001',
        'provider': 'Trellis Healthcare'
    }
    
    return jsonify({
        'status': 'success',
        'message': 'Account linked successfully',
        'linkId': 'LINK-001',
        'provider': 'Trellis Healthcare'
    })

@app.route('/transaction-status/<transaction_id>', methods=['GET'])
def get_transaction_status(transaction_id):
    """Get transaction status with mock FHIR EOB data (legacy endpoint)"""
    
    mock_transaction = {
        'id': transaction_id,
        'provider': 'Downtown Dental Associates',
        'dateOfService': '2025-08-19',
        'patientResponsibility': 30.00,
        'currency': 'USD',
        'status': 'Pending',
        'source': 'Pending Verification',
        'eob': {
            'resourceType': 'ExplanationOfBenefit',
            'id': 'EOB-DENTAL-12345',
            'status': 'active',
            'type': {
                'coding': [{
                    'system': 'http://terminology.hl7.org/CodeSystem/claim-type',
                    'code': 'oral',
                    'display': 'Dental'
                }],
                'text': 'Dental'
            },
            'patient': {
                'reference': 'Patient/123',
                'display': 'John Appleseed'
            },
            'billablePeriod': {'start': '2025-08-19'},
            'provider': {
                'reference': 'Organization/456',
                'display': 'Downtown Dental Associates'
            },
            'item': [{
                'sequence': 1,
                'productOrService': {
                    'coding': [{
                        'system': 'http://www.ada.org/cdt',
                        'code': 'D1110',
                        'display': 'Adult Dental Prophylaxis'
                    }],
                    'text': 'Adult Dental Prophylaxis'
                },
                'servicedDate': '2025-08-19',
                'adjudication': [
                    {'category': {'coding': [{'code': 'submitted'}]}, 'amount': {'value': 150.00, 'currency': 'USD'}},
                    {'category': {'coding': [{'code': 'benefit'}]}, 'amount': {'value': 120.00, 'currency': 'USD'}},
                    {'category': {'coding': [{'code': 'patient-pay'}]}, 'amount': {'value': 30.00, 'currency': 'USD'}}
                ]
            }],
            'total': [
                {'category': {'coding': [{'code': 'submitted'}]}, 'amount': {'value': 150.00, 'currency': 'USD'}},
                {'category': {'coding': [{'code': 'benefit'}]}, 'amount': {'value': 120.00, 'currency': 'USD'}},
                {'category': {'coding': [{'code': 'patient-pay'}]}, 'amount': {'value': 30.00, 'currency': 'USD'}}
            ],
            'payment': {'amount': {'value': 120.00, 'currency': 'USD'}}
        }
    }
    
    return jsonify(mock_transaction)

@app.route('/events', methods=['GET'])
def events():
    """Server-Sent Events endpoint for real-time updates"""
    def generate():
        # Send transaction update after 3 seconds
        time.sleep(3)
        event_data = {
            'type': 'transactionUpdated',
            'transaction': {
                'id': 'TX-001',
                'status': 'Approved',
                'source': 'Verified by Provider'
            }
        }
        yield f"data: {json.dumps(event_data)}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

if __name__ == '__main__':
    print("🚀 Starting WEX FSA Provider Substantiation API...")
    print("📍 Backend server will run on http://localhost:4000")
    print("🔍 Health check: http://localhost:4000/health")
    print("🔐 Epic OAuth: http://localhost:4000/auth/epic")
    print("📊 Expenses API: http://localhost:4000/api/expenses")
    print("📡 Events endpoint: http://localhost:4000/events")
    print("🔗 Link account: POST http://localhost:4000/link-account")
    print("📊 Transaction status: GET http://localhost:4000/transaction-status/<id>")
    print("\n" + "="*60)
    print("⚠️  IMPORTANT: Set EPIC_CLIENT_ID environment variable for OAuth")
    print("="*60)
    
    app.run(host='0.0.0.0', port=4000, debug=True)
