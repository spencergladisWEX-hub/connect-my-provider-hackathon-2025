# FHIR Compliance Documentation

## Overview
This project implements FHIR R4 standard for healthcare data exchange, specifically focusing on ExplanationOfBenefit (EOB) resources for dental claims processing.

## FHIR Implementation

### Supported FHIR Resources

#### ExplanationOfBenefit (EOB)
The primary FHIR resource used for claim substantiation.

**Resource Profile**: http://hl7.org/fhir/R4/explanationofbenefit.html

### Example EOB Structure
```json
{
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
  "billablePeriod": {
    "start": "2025-08-19"
  },
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
      {
        "category": {
          "coding": [{"code": "submitted"}]
        }, 
        "amount": {
          "value": 150.00, 
          "currency": "USD"
        }
      },
      {
        "category": {
          "coding": [{"code": "benefit"}]
        }, 
        "amount": {
          "value": 120.00, 
          "currency": "USD"
        }
      },
      {
        "category": {
          "coding": [{"code": "patient-pay"}]
        }, 
        "amount": {
          "value": 30.00, 
          "currency": "USD"
        }
      }
    ]
  }],
  "total": [
    {
      "category": {
        "coding": [{"code": "submitted"}]
      }, 
      "amount": {
        "value": 150.00, 
        "currency": "USD"
      }
    },
    {
      "category": {
        "coding": [{"code": "benefit"}]
      }, 
      "amount": {
        "value": 120.00, 
        "currency": "USD"
      }
    },
    {
      "category": {
        "coding": [{"code": "patient-pay"}]
      }, 
      "amount": {
        "value": 30.00, 
        "currency": "USD"
      }
    }
  ],
  "payment": {
    "amount": {
      "value": 120.00, 
      "currency": "USD"
    }
  }
}
```

## Code Systems Used

### Claim Types
- **System**: `http://terminology.hl7.org/CodeSystem/claim-type`
- **Code**: `oral`
- **Display**: `Dental`

### Procedure Codes
- **System**: `http://www.ada.org/cdt` (American Dental Association Current Dental Terminology)
- **Code**: `D1110`
- **Display**: `Adult Dental Prophylaxis`

### Adjudication Categories
- `submitted` - Amount submitted to payer
- `benefit` - Amount covered by insurance
- `patient-pay` - Patient responsibility amount

## FHIR Validation

### Required Elements
All EOB resources must include:
- `resourceType`: "ExplanationOfBenefit"
- `id`: Unique identifier
- `status`: Resource status (active, cancelled, draft, entered-in-error)
- `type`: Claim type with proper coding
- `patient`: Reference to patient
- `provider`: Reference to provider organization
- `item`: Array of claim line items with:
  - `sequence`: Line item number
  - `productOrService`: Service/procedure with proper coding
  - `servicedDate`: Date of service
  - `adjudication`: Array of financial adjudications

### Optional but Recommended Elements
- `billablePeriod`: Service period
- `total`: Financial totals summary
- `payment`: Payment information

## Integration with Epic FHIR

### Current Status
The demo uses mock FHIR data. For production Epic integration:

### OAuth 2.0 Flow
1. **Authorization Request**
   ```
   GET https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize
     ?response_type=code
     &client_id={client_id}
     &redirect_uri={redirect_uri}
     &scope=patient/ExplanationOfBenefit.read
     &state={state}
   ```

2. **Token Exchange**
   ```bash
   POST https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token
   Content-Type: application/x-www-form-urlencoded
   
   grant_type=authorization_code
   &code={authorization_code}
   &redirect_uri={redirect_uri}
   &client_id={client_id}
   ```

3. **FHIR API Calls**
   ```bash
   GET https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/ExplanationOfBenefit/{id}
   Authorization: Bearer {access_token}
   Accept: application/fhir+json
   ```

### Epic FHIR Endpoints
- **Base URL**: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
- **ExplanationOfBenefit**: `/ExplanationOfBenefit/{id}`
- **Patient Search**: `/Patient?identifier={mrn}`

## Data Mapping

### Frontend Display Mapping
```javascript
// Map FHIR EOB to UI display
const mapEOBToTransaction = (eob) => ({
  id: eob.id,
  provider: eob.provider.display,
  dateOfService: eob.item[0].servicedDate,
  patientResponsibility: eob.item[0].adjudication
    .find(adj => adj.category.coding[0].code === 'patient-pay')
    .amount.value,
  currency: eob.item[0].adjudication[0].amount.currency,
  service: eob.item[0].productOrService.text
});
```

## Compliance Requirements

### HIPAA Compliance
- All FHIR data contains PHI and must be handled according to HIPAA regulations
- Implement proper access controls and audit logging
- Use secure transmission (HTTPS/TLS 1.2+)
- Encrypt data at rest

### FHIR Security
- Implement OAuth 2.0 authentication
- Use SMART on FHIR authorization framework
- Validate all FHIR resources against official schemas
- Handle error cases gracefully

## Testing FHIR Compliance

### Validation Tools
- **FHIR Validator**: https://www.hl7.org/fhir/validation.html
- **Touchstone Testing**: https://touchstone.aegis.net/touchstone/
- **Epic FHIR Validation**: Use Epic's FHIR testing environments

### Test Cases
1. **Valid EOB Resource**: Ensure all required elements are present
2. **Invalid EOB Resource**: Test error handling for malformed data
3. **Missing Required Fields**: Verify validation catches missing elements
4. **Invalid Code Systems**: Test handling of unknown codes

---

*For implementation details, see the [Developer Guide](01-DEVELOPER_GUIDE.md) and [API Reference](02-API_REFERENCE.md).*