from flask import Flask, jsonify, request, Response, session, redirect, url_for, make_response
from flask_cors import CORS
import json
import time
import threading
import os

# Import our new modules
from env_config import EPIC_CONFIG, TEST_PATIENTS, TEST_USERS, DEMO_CONFIG
from oauth_handler import EpicOAuthHandler
from fhir_client import EpicFHIRClient
from transformers import transform_any_eob_data_to_expenses, transform_patient_data

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
    """Initiate Epic OAuth flow - returns OAuth URL for frontend to open in new window"""
    try:
        if DEMO_CONFIG['use_mock_oauth']:
            # Mock OAuth flow for demo purposes
            print("🎭 Using mock OAuth for demo")
            
            mock_token_info = {
                'access_token': 'mock_access_token_demo_2025',
                'token_type': 'Bearer',
                'expires_in': 3600,
                'scope': 'openid patient/*.read explanationofbenefit/*.read claimofbenefit/*.read',
                'patient_id': DEMO_CONFIG['mock_patient_id'],
                'id_token': 'mock_id_token_demo_2025'
            }
            
            # Store mock token info in session
            session['access_token'] = mock_token_info['access_token']
            session['patient_id'] = mock_token_info['patient_id']
            session['token_expires'] = time.time() + mock_token_info['expires_in']
            
            print(f"✅ Mock OAuth successful - Patient ID: {mock_token_info['patient_id']}")
            
            # Return success response for frontend
            return jsonify({
                'status': 'success',
                'message': 'Mock authentication successful',
                'patient_id': mock_token_info['patient_id'],
                'provider': DEMO_CONFIG['mock_provider_name']
            })
        else:
            # Real Epic OAuth flow - always return OAuth URL for frontend
            state = oauth_handler.generate_state()
            session['oauth_state'] = state
            
            auth_url = oauth_handler.get_authorization_url(state)
            
            print(f"🔐 Initiating Epic OAuth flow with state: {state}")
            print(f"🔐 OAuth URL generated: {auth_url}")
            
            # Always return OAuth URL as JSON for frontend to handle
            return jsonify({
                'status': 'success',
                'oauth_url': auth_url,
                'message': 'OAuth URL generated for frontend'
            })
        
    except Exception as e:
        print(f"❌ OAuth initiation failed: {e}")
        return jsonify({'error': 'OAuth initiation failed'}), 500



@app.route('/auth/epic/callback', methods=['GET'])
def epic_oauth_callback():
    """Handle OAuth callback from Epic"""
    try:
        # Get OAuth parameters from callback
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            print(f"❌ OAuth error from Epic: {error}")
            return jsonify({'error': f'OAuth error: {error}'}), 400
        
        if not code or not state:
            print("❌ Missing OAuth parameters")
            return jsonify({'error': 'Missing OAuth parameters'}), 400
        
        # Validate state parameter
        stored_state = session.get('oauth_state')
        if not stored_state or state != stored_state:
            print("❌ Invalid OAuth state parameter")
            return jsonify({'error': 'Invalid OAuth state'}), 400
        
        print(f"✅ OAuth callback received - Code: {code[:10]}..., State: {state}")
        
        # Exchange authorization code for access token
        token_response = oauth_handler.exchange_code_for_token(code)
        
        if 'error' in token_response:
            print(f"❌ Token exchange failed: {token_response['error']}")
            return jsonify({'error': 'Token exchange failed'}), 500
        
        if not oauth_handler.validate_token_response(token_response):
            print("❌ Invalid token response from Epic")
            return jsonify({'error': 'Invalid token response'}), 500
        
        # Extract token information
        token_info = oauth_handler.get_token_info(token_response)
        
        # Store token in session
        session['access_token'] = token_info['access_token']
        session['patient_id'] = token_info.get('patient_id', DEMO_CONFIG['mock_patient_id'])
        session['token_expires'] = time.time() + token_info.get('expires_in', 3600)
        
        print(f"✅ OAuth successful - Patient ID: {session['patient_id']}")
        
        # Redirect user back to frontend with success
        frontend_url = 'http://localhost:3000'
        success_url = f"{frontend_url}?oauth_success=true&patient_id={session['patient_id']}&provider=Epic%20FHIR"
        
        print(f"✅ OAuth successful - redirecting to frontend: {success_url}")
        
        return redirect(success_url)
        
    except Exception as e:
        print(f"❌ OAuth callback handling failed: {e}")
        return jsonify({'error': 'OAuth callback failed'}), 500

@app.route('/auth/test-iframe', methods=['GET'])
def test_iframe():
    """Simple test page for iframe functionality"""
    html_content = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Iframe Test</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 20px;
                background: #f0f0f0;
                margin: 0;
            }
            .test-container {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                text-align: center;
            }
            .success {
                color: #16a34a;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="test-container">
            <h1 class="success">✅ Iframe Test Successful!</h1>
            <p>If you can see this page, the iframe is working correctly.</p>
            <p>This confirms that:</p>
            <ul style="text-align: left; display: inline-block;">
                <li>✅ Iframe can load content</li>
                <li>✅ Cross-origin restrictions are resolved</li>
                <li>✅ Content is accessible</li>
            </ul>
            <p><strong>Next:</strong> The OAuth page should load in 3 seconds...</p>
        </div>
        <script>
            setTimeout(() => {
                if (window.parent) {
                    window.parent.postMessage({
                        type: 'iframe_test_success',
                        message: 'Iframe test completed successfully'
                    }, '*');
                }
            }, 1000);
        </script>
    </body>
    </html>
    '''
    
    response = make_response(html_content)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    
    return response



@app.route('/auth/mock-oauth-page', methods=['GET'])
def mock_oauth_page():
    """Mock OAuth page for testing embedded iframe"""
    html_content = '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mock Epic OAuth</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 40px 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 400px;
                width: 100%;
            }
            .epic-logo {
                text-align: center;
                margin-bottom: 30px;
            }
            .epic-logo h1 {
                color: #1f4788;
                font-size: 2rem;
                margin: 0;
                font-weight: 700;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: 500;
            }
            input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e1e5e9;
                border-radius: 8px;
                font-size: 16px;
                transition: border-color 0.3s ease;
            }
            input:focus {
                outline: none;
                border-color: #1f4788;
            }
            .btn-login {
                width: 100%;
                background: #1f4788;
                color: white;
                border: none;
                padding: 14px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .btn-login:hover {
                background: #164070;
            }
            .help-text {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 14px;
            }
            .test-credentials {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 20px;
                font-size: 14px;
                color: #495057;
            }
            .test-credentials strong {
                color: #1f4788;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="epic-logo">
                <h1>Epic</h1>
                <p>Secure Authentication</p>
            </div>
            
            <div class="test-credentials">
                <strong>Test Credentials:</strong><br>
                Username: fhircamila<br>
                Password: epicepic1
            </div>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" value="fhircamila" required>
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" value="epicepic1" required>
                </div>
                
                <button type="submit" class="btn-login">Sign In</button>
            </form>
            
            <div class="help-text">
                This is a mock authentication page for testing purposes.
            </div>
        </div>
        
        <script>
            document.getElementById('loginForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                // Simulate authentication
                if (username === 'fhircamila' && password === 'epicepic1') {
                    // Simulate successful OAuth
                    setTimeout(() => {
                        // Post message to parent window (the modal)
                        if (window.parent) {
                            window.parent.postMessage({
                                type: 'oauth_success',
                                patient_id: 'erXuFYUfucBZaryVksYEcMg3',
                                provider: 'Epic Systems'
                            }, '*');
                        }
                        
                        // Also redirect for fallback
                        window.location.href = 'http://localhost:3000/auth/callback?code=mock_auth_code&state=mock_state';
                    }, 1000);
                } else {
                    alert('Invalid credentials. Please use the test credentials provided.');
                }
            });
        </script>
    </body>
    </html>
    '''
    
    # Add CORS headers for iframe embedding
    response = make_response(html_content)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['X-Frame-Options'] = 'ALLOWALL'
    
    return response

@app.route('/auth/callback', methods=['GET'])
def auth_callback():
    """Handle OAuth callback from Epic or mock callback for demo"""
    try:
        if DEMO_CONFIG['use_mock_oauth']:
            # Mock callback for demo
            print("🎭 Mock OAuth callback for demo")
            
            return jsonify({
                'status': 'success',
                'message': 'Mock OAuth callback successful',
                'patient_id': DEMO_CONFIG['mock_patient_id'],
                'provider': DEMO_CONFIG['mock_provider_name']
            })
        
        # Real Epic OAuth callback handling
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
    """Generate expense tracker from FHIR data - FOCUSED ON EOB APIs"""
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
        
        print(f"🔍 Fetching EOB data for patient: {patient_id}")
        
        # Initialize FHIR client
        fhir_client = EpicFHIRClient(EPIC_CONFIG['fhir_base_url'], access_token)
        
        # Fetch patient data first
        patient = fhir_client.get_patient(patient_id)
        if 'error' in patient:
            print(f"❌ Failed to fetch patient: {patient['error']}")
            return jsonify({'error': 'Failed to fetch patient data'}), 500
        
        # FOCUSED APPROACH: Get EOB data with fallback strategy
        eob_data = fhir_client.get_eob_data(patient_id)
        
        if eob_data['count'] == 0:
            print("❌ No EOB or Claim data found")
            return jsonify({
                'error': 'No EOB data available',
                'patient': transform_patient_data(patient),
                'expenses': [],
                'source': 'none'
            }), 404
        
        # Transform EOB data to expenses
        expenses = transform_any_eob_data_to_expenses(eob_data, patient)
        patient_info = transform_patient_data(patient)
        
        print(f"✅ Successfully processed {len(expenses)} expenses from {eob_data['source']}")
        
        return jsonify({
            'patient': patient_info,
            'expenses': expenses,
            'source': eob_data['source'],
            'count': eob_data['count'],
            'fhir_patient_id': patient_id,
            'message': f'Successfully fetched {len(expenses)} expenses from {eob_data["source"]}'
        })
        
    except Exception as e:
        print(f"❌ Error fetching expenses: {e}")
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@app.route('/api/test-eob', methods=['GET'])
def test_eob_apis():
    """Test EOB APIs specifically for debugging"""
    try:
        # Check if user is authenticated
        access_token = session.get('access_token')
        patient_id = session.get('patient_id')
        
        if not access_token or not patient_id:
            print("❌ User not authenticated")
            return jsonify({'error': 'Not authenticated'}), 401
        
        print(f"🧪 Testing EOB APIs for patient: {patient_id}")
        
        # Initialize FHIR client
        fhir_client = EpicFHIRClient(EPIC_CONFIG['fhir_base_url'], access_token)
        
        # Test ExplanationOfBenefit API
        print("📊 Testing ExplanationOfBenefit API...")
        eobs = fhir_client.get_explanation_of_benefits(patient_id)
        eob_count = len(eobs) if eobs else 0
        
        # Test Claim API
        print("📊 Testing Claim API...")
        claims = fhir_client.get_claims(patient_id)
        claim_count = len(claims) if claims else 0
        
        # Test combined approach
        print("📊 Testing combined EOB approach...")
        eob_data = fhir_client.get_eob_data(patient_id)
        
        return jsonify({
            'patient_id': patient_id,
            'explanation_of_benefit': {
                'count': eob_count,
                'available': eob_count > 0,
                'sample_data': eobs[0] if eobs else None
            },
            'claim': {
                'count': claim_count,
                'available': claim_count > 0,
                'sample_data': claims[0] if claims else None
            },
            'combined_result': {
                'source': eob_data['source'],
                'count': eob_data['count'],
                'success': eob_data['count'] > 0
            },
            'recommendation': 'Use ExplanationOfBenefit if available, fallback to Claim'
        })
        
    except Exception as e:
        print(f"❌ Error testing EOB APIs: {e}")
        return jsonify({'error': 'Failed to test EOB APIs'}), 500

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
    """Enhanced provider account linking with OAuth integration"""
    try:
        data = request.get_json()
        provider = data.get('provider', DEMO_CONFIG['mock_provider_name'])
        
        print(f"🔗 Linking account for provider: {provider}")
        
        # Simulate processing time
        time.sleep(2)
        
        # Use mock patient ID from config
        patient_id = DEMO_CONFIG['mock_patient_id']
        
        # Update mock state
        mock_state['link_status'] = 'connected'
        mock_state['current_user'] = {
            'id': 'USER-001',
            'provider': provider,
            'patient_id': patient_id,
            'connected_at': time.strftime('%Y-%m-%d %H:%M:%S'),
            'oauth_status': 'authenticated' if DEMO_CONFIG['use_mock_oauth'] else 'pending'
        }
        
        return jsonify({
            'status': 'success',
            'message': f'Successfully connected to {provider}',
            'linkId': 'LINK-001',
            'provider': provider,
            'patient_id': patient_id,
            'oauth_status': 'authenticated' if DEMO_CONFIG['use_mock_oauth'] else 'pending'
        })
        
    except Exception as e:
        print(f"❌ Link account failed: {e}")
        return jsonify({'error': 'Link account failed'}), 500

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
