# Testing Documentation

## Testing Strategy

### Current Testing Status
⚠️ **The demo currently relies on manual testing. Automated testing should be implemented for production use.**

## Testing Levels

### 1. Unit Testing

#### Backend Unit Tests
Test individual functions and methods in isolation.

**Recommended Framework**: pytest

```python
# Example: tests/test_server.py
import pytest
from src.server import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'
    assert 'timestamp' in data
    assert data['service'] == 'WEX FSA Provider Substantiation API'

def test_link_account(client):
    """Test account linking"""
    response = client.post('/link-account', 
                          json={'provider': 'Trellis Healthcare'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'success'
    assert data['provider'] == 'Trellis Healthcare'

def test_transaction_status(client):
    """Test transaction retrieval"""
    response = client.get('/transaction-status/TX-001')
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == 'TX-001'
    assert 'eob' in data
    assert data['eob']['resourceType'] == 'ExplanationOfBenefit'
```

#### Frontend Unit Tests
Test JavaScript functions and UI components.

**Recommended Framework**: Jest

```javascript
// Example: tests/frontend.test.js
describe('Transaction Management', () => {
    test('addTransaction creates table row', () => {
        document.body.innerHTML = `
            <table><tbody id="transactionTableBody"></tbody></table>
        `;
        
        const transaction = {
            id: 'TX-001',
            provider: 'Test Provider',
            dateOfService: '2024-08-15',
            patientResponsibility: 30.00,
            status: 'Pending',
            source: 'Test Source'
        };
        
        addTransaction(transaction);
        
        const row = document.getElementById('transaction-TX-001');
        expect(row).toBeTruthy();
        expect(row.cells[0].textContent).toBe('Test Provider');
        expect(row.cells[3].textContent).toBe('Pending');
    });
    
    test('updateTransaction modifies existing row', () => {
        // Setup existing row
        document.body.innerHTML = `
            <table><tbody id="transactionTableBody">
                <tr id="transaction-TX-001" class="status-pending">
                    <td>Provider</td><td>2024-08-15</td><td>$30.00</td>
                    <td class="status-pending">Pending</td><td>Source</td>
                </tr>
            </tbody></table>
        `;
        
        updateTransaction('TX-001', {
            status: 'Approved',
            source: 'Verified by Provider'
        });
        
        const row = document.getElementById('transaction-TX-001');
        expect(row.cells[3].textContent).toBe('Approved');
        expect(row.cells[4].textContent).toBe('Verified by Provider');
        expect(row.className).toBe('status-approved');
    });
});
```

### 2. Integration Testing

#### API Integration Tests
Test complete request/response cycles.

```python
# Example: tests/test_integration.py
import requests
import time
import threading

def test_complete_flow():
    """Test complete user flow"""
    base_url = 'http://localhost:4000'
    
    # 1. Check health
    health = requests.get(f'{base_url}/health')
    assert health.status_code == 200
    
    # 2. Link account
    link_response = requests.post(f'{base_url}/link-account',
                                 json={'provider': 'Trellis Healthcare'})
    assert link_response.status_code == 200
    
    # 3. Get transaction
    transaction = requests.get(f'{base_url}/transaction-status/TX-001')
    assert transaction.status_code == 200
    data = transaction.json()
    assert data['status'] == 'Pending'
    
    # 4. Test events endpoint (basic connection test)
    events_response = requests.get(f'{base_url}/events', 
                                  stream=True, timeout=5)
    assert events_response.status_code == 200
    assert events_response.headers['content-type'] == 'text/event-stream; charset=utf-8'

def test_server_sent_events():
    """Test real-time events functionality"""
    import sseclient
    
    base_url = 'http://localhost:4000'
    
    # Connect to events stream
    response = requests.get(f'{base_url}/events', stream=True)
    client = sseclient.SSEClient(response)
    
    # Wait for event (should arrive after 3 seconds)
    event_received = False
    start_time = time.time()
    
    for event in client.events():
        if event.data:
            data = json.loads(event.data)
            assert data['type'] == 'transactionUpdated'
            assert data['transaction']['status'] == 'Approved'
            event_received = True
            break
        
        # Timeout after 10 seconds
        if time.time() - start_time > 10:
            break
    
    assert event_received, "No event received within timeout"
```

### 3. End-to-End Testing

#### Browser Automation Tests
Test complete user workflows using Selenium.

```python
# Example: tests/test_e2e.py
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestE2EFlow:
    def setup_method(self):
        self.driver = webdriver.Chrome()
        self.driver.get('http://localhost:3000')
    
    def teardown_method(self):
        self.driver.quit()
    
    def test_complete_user_flow(self):
        """Test the complete demo flow"""
        wait = WebDriverWait(self.driver, 10)
        
        # 1. Verify initial state
        connect_button = wait.until(
            EC.element_to_be_clickable((By.ID, 'connectButton'))
        )
        assert connect_button.text == 'Connect My Provider'
        
        # 2. Click connect button
        connect_button.click()
        
        # 3. Verify overlay appears
        overlay = wait.until(
            EC.visibility_of_element_located((By.ID, 'authOverlay'))
        )
        assert 'Connecting to Provider...' in overlay.text
        
        # 4. Wait for overlay to disappear and success message
        wait.until(EC.invisibility_of_element(overlay))
        success_message = wait.until(
            EC.visibility_of_element_located((By.ID, 'successMessage'))
        )
        assert 'Successfully connected' in success_message.text
        
        # 5. Verify transaction appears
        transaction_table = wait.until(
            EC.visibility_of_element_located((By.ID, 'transactionTable'))
        )
        
        # 6. Wait for transaction to be updated to "Approved"
        approved_status = wait.until(
            EC.text_to_be_present_in_element(
                (By.CSS_SELECTOR, '#transactionTableBody tr td:nth-child(4)'),
                'Approved'
            )
        )
        assert approved_status
        
        # 7. Verify final state
        status_cell = self.driver.find_element(
            By.CSS_SELECTOR, '#transactionTableBody tr td:nth-child(4)'
        )
        assert status_cell.text == 'Approved'
        
        source_cell = self.driver.find_element(
            By.CSS_SELECTOR, '#transactionTableBody tr td:nth-child(5)'
        )
        assert 'Verified by Provider' in source_cell.text
```

## Performance Testing

### Load Testing
Test system performance under various loads.

```python
# Example: tests/test_performance.py
import requests
import concurrent.futures
import time

def test_concurrent_requests():
    """Test system with multiple concurrent requests"""
    base_url = 'http://localhost:4000'
    
    def make_request():
        start_time = time.time()
        response = requests.get(f'{base_url}/health')
        end_time = time.time()
        return response.status_code, end_time - start_time
    
    # Test with 50 concurrent requests
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
        futures = [executor.submit(make_request) for _ in range(50)]
        results = [future.result() for future in futures]
    
    # Verify all requests succeeded
    status_codes = [result[0] for result in results]
    response_times = [result[1] for result in results]
    
    assert all(code == 200 for code in status_codes)
    assert max(response_times) < 5.0  # Max 5 second response time
    assert sum(response_times) / len(response_times) < 1.0  # Avg under 1 second
```

## Manual Testing

### Test Scenarios

#### Scenario 1: Happy Path
1. Navigate to http://localhost:3000
2. Click "Connect My Provider"
3. Observe 2-second loading overlay
4. Verify success message appears
5. Confirm transaction appears as "Pending"
6. Wait 3 seconds for auto-approval
7. Verify status changes to "Approved (Verified by Provider)"

#### Scenario 2: Error Handling
1. Stop backend server
2. Navigate to frontend
3. Click "Connect My Provider"
4. Verify appropriate error message
5. Restart backend and retry

#### Scenario 3: Multiple Browsers
1. Open demo in multiple browser tabs/windows
2. Test concurrent usage
3. Verify events work independently

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Mobile Testing
- Test responsive design on various screen sizes
- Verify touch interactions work properly
- Check loading states on slower connections

## Test Data Management

### Mock Data Strategy
```python
# Centralized test data
TEST_DATA = {
    'transactions': {
        'TX-001': {
            'id': 'TX-001',
            'provider': 'Downtown Dental Associates',
            'dateOfService': '2025-08-19',
            'patientResponsibility': 30.00,
            'status': 'Pending',
            'source': 'Pending Verification'
        }
    },
    'eob': {
        'resourceType': 'ExplanationOfBenefit',
        'id': 'EOB-DENTAL-12345',
        # ... rest of EOB structure
    }
}
```

## Continuous Integration

### GitHub Actions Example
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.9
    
    - name: Install dependencies
      run: |
        pip install -r wex-fsa-provider-substantiation-backend/requirements.txt
        pip install pytest selenium
    
    - name: Start servers
      run: |
        ./start_demo.sh &
        sleep 5
    
    - name: Run tests
      run: pytest tests/
    
    - name: Run E2E tests
      run: pytest tests/test_e2e.py
```

## Test Reporting

### Coverage Reports
```bash
# Generate coverage report
pip install pytest-cov
pytest --cov=src tests/
pytest --cov=src --cov-report=html tests/
```

### Test Documentation
- Maintain test case documentation
- Document known issues and limitations
- Track test metrics and coverage goals

---

*For setup instructions, see the [Developer Guide](01-DEVELOPER_GUIDE.md).*