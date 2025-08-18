from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import json
import time
import threading

app = Flask(__name__)
CORS(app)

# Mock data store
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
        'service': 'WEX FSA Provider Substantiation API'
    })

@app.route('/link-account', methods=['POST'])
def link_account():
    """Mock provider account linking"""
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
    """Get transaction status with mock FHIR EOB data"""
    
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
    print("📡 Events endpoint: http://localhost:4000/events")
    print("🔗 Link account: POST http://localhost:4000/link-account")
    print("📊 Transaction status: GET http://localhost:4000/transaction-status/<id>")
    print("\n" + "="*60)
    
    app.run(host='0.0.0.0', port=4000, debug=True)
