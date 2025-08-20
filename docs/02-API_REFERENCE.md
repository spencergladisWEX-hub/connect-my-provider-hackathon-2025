# API Reference

## Base URL
```
http://localhost:4000
```

## Authentication
Currently no authentication is required. This is a demo implementation with mock data.

## Endpoints

### Health Check
**GET** `/health`

Returns the health status of the API server.

#### Response
```json
{
  "status": "ok",
  "timestamp": "2024-08-15 21:44:30",
  "service": "WEX FSA Provider Substantiation API"
}
```

#### Example
```bash
curl http://localhost:4000/health
```

---

### Link Provider Account
**POST** `/link-account`

Simulates linking a provider account. Includes a 2-second processing delay.

#### Request Body
```json
{
  "provider": "Trellis Healthcare"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Account linked successfully",
  "linkId": "LINK-001",
  "provider": "Trellis Healthcare"
}
```

#### Example
```bash
curl -X POST http://localhost:4000/link-account \
  -H "Content-Type: application/json" \
  -d '{"provider":"Trellis Healthcare"}'
```

#### Status Codes
- `200 OK` - Account linked successfully
- `400 Bad Request` - Invalid request format
- `500 Internal Server Error` - Server processing error

---

### Get Transaction Status
**GET** `/transaction-status/{transaction_id}`

Retrieves transaction details including FHIR ExplanationOfBenefit data.

#### Parameters
- `transaction_id` (string) - Unique transaction identifier

#### Response
```json
{
  "id": "TX-001",
  "provider": "Downtown Dental Associates",
  "dateOfService": "2025-08-19",
  "patientResponsibility": 30.00,
  "currency": "USD",
  "status": "Pending",
  "source": "Pending Verification",
  "eob": {
    "resourceType": "ExplanationOfBenefit",
    "id": "EOB-DENTAL-12345",
    "status": "active",
    "type": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/claim-type",
        "code": "oral",
        "display": "Dental"
      }],
      "text": "Dental"
    },
    "patient": {
      "reference": "Patient/123",
      "display": "John Appleseed"
    },
    "billablePeriod": {"start": "2025-08-19"},
    "provider": {
      "reference": "Organization/456",
      "display": "Downtown Dental Associates"
    },
    "item": [{
      "sequence": 1,
      "productOrService": {
        "coding": [{
          "system": "http://www.ada.org/cdt",
          "code": "D1110",
          "display": "Adult Dental Prophylaxis"
        }],
        "text": "Adult Dental Prophylaxis"
      },
      "servicedDate": "2025-08-19",
      "adjudication": [
        {"category": {"coding": [{"code": "submitted"}]}, "amount": {"value": 150.00, "currency": "USD"}},
        {"category": {"coding": [{"code": "benefit"}]}, "amount": {"value": 120.00, "currency": "USD"}},
        {"category": {"coding": [{"code": "patient-pay"}]}, "amount": {"value": 30.00, "currency": "USD"}}
      ]
    }],
    "total": [
      {"category": {"coding": [{"code": "submitted"}]}, "amount": {"value": 150.00, "currency": "USD"}},
      {"category": {"coding": [{"code": "benefit"}]}, "amount": {"value": 120.00, "currency": "USD"}},
      {"category": {"coding": [{"code": "patient-pay"}]}, "amount": {"value": 30.00, "currency": "USD"}}
    ],
    "payment": {"amount": {"value": 120.00, "currency": "USD"}}
  }
}
```

#### Example
```bash
curl http://localhost:4000/transaction-status/TX-001
```

#### Status Codes
- `200 OK` - Transaction found and returned
- `404 Not Found` - Transaction not found
- `500 Internal Server Error` - Server processing error

---

### Real-time Events
**GET** `/events`

Server-Sent Events (SSE) endpoint for real-time transaction updates.

#### Response Format
Event-stream with updates sent as Server-Sent Events.

#### Event Types
- `transactionUpdated` - Transaction status change

#### Example Event Data
```json
{
  "type": "transactionUpdated",
  "transaction": {
    "id": "TX-001",
    "status": "Approved",
    "source": "Verified by Provider"
  }
}
```

#### JavaScript Client Example
```javascript
const eventSource = new EventSource('http://localhost:4000/events');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Received event:', data);
  
  if (data.type === 'transactionUpdated') {
    // Handle transaction update
    updateUI(data.transaction);
  }
};

eventSource.onerror = function(error) {
  console.error('EventSource error:', error);
  eventSource.close();
};
```

#### Behavior
- Connection automatically sends transaction update after 3 seconds
- Events are sent in `text/event-stream` format
- Client should handle reconnection on error

---

## Error Handling

### Error Response Format
```json
{
  "error": "Error description",
  "status": "error"
}
```

### Common Errors
- **400 Bad Request** - Malformed request body or parameters
- **404 Not Found** - Requested resource not found
- **500 Internal Server Error** - Unexpected server error

## Rate Limiting
Currently no rate limiting is implemented. This is a demo environment.

## CORS Policy
CORS is enabled for all origins to support local development.

---

*For implementation details, see the [Developer Guide](01-DEVELOPER_GUIDE.md).*