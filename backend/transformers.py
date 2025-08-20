from typing import Dict, List, Optional
from datetime import datetime

def transform_eobs_to_expenses(eobs: List[Dict], patient: Dict) -> List[Dict]:
    """Transform FHIR EOB resources to expense tracker format"""
    expenses = []
    
    for eob in eobs:
        if eob.get('resourceType') != 'ExplanationOfBenefit':
            continue
            
        # Extract expense data from EOB
        expense = {
            'id': eob.get('id', 'unknown'),
            'date': extract_service_date(eob),
            'provider': extract_provider_name(eob),
            'service': extract_service_description(eob),
            'amount': extract_patient_responsibility(eob),
            'status': determine_expense_status(eob),
            'category': categorize_expense(eob),
            'fhir_data': eob,  # Keep original FHIR data
            'patient_name': extract_patient_name(patient),
            'currency': extract_currency(eob)
        }
        
        expenses.append(expense)
    
    return expenses

def extract_service_date(eob: Dict) -> str:
    """Extract service date from EOB"""
    # Try billablePeriod first
    if 'billablePeriod' in eob and 'start' in eob['billablePeriod']:
        return eob['billablePeriod']['start']
    
    # Try items servicedDate
    if 'item' in eob and len(eob['item']) > 0:
        item = eob['item'][0]
        if 'servicedDate' in item:
            return item['servicedDate']
    
    return datetime.now().strftime('%Y-%m-%d')

def extract_provider_name(eob: Dict) -> str:
    """Extract provider name from EOB"""
    if 'provider' in eob and 'display' in eob['provider']:
        return eob['provider']['display']
    
    if 'organization' in eob and 'display' in eob['organization']:
        return eob['organization']['display']
    
    return 'Unknown Provider'

def extract_service_description(eob: Dict) -> str:
    """Extract service description from EOB"""
    if 'item' in eob and len(eob['item']) > 0:
        item = eob['item'][0]
        
        # Try productOrService text first
        if 'productOrService' in item and 'text' in item['productOrService']:
            return item['productOrService']['text']
        
        # Try coding display
        if 'productOrService' in item and 'coding' in item['productOrService']:
            coding = item['productOrService']['coding'][0]
            if 'display' in coding:
                return coding['display']
    
    return 'Unknown Service'

def extract_patient_responsibility(eob: Dict) -> float:
    """Extract patient responsibility amount from EOB"""
    # Check total section first
    if 'total' in eob:
        for total in eob['total']:
            if 'category' in total and 'coding' in total['category']:
                coding = total['category']['coding'][0]
                if coding.get('code') == 'patient-pay' and 'amount' in total:
                    return float(total['amount']['value'])
    
    # Check item adjudication
    if 'item' in eob and len(eob['item']) > 0:
        item = eob['item'][0]
        if 'adjudication' in item:
            for adj in item['adjudication']:
                if 'category' in adj and 'coding' in adj['category']:
                    coding = adj['category']['coding'][0]
                    if coding.get('code') == 'patient-pay' and 'amount' in adj:
                        return float(adj['amount']['value'])
    
    return 0.0

def determine_expense_status(eob: Dict) -> str:
    """Determine expense status based on EOB data"""
    status = eob.get('status', 'unknown')
    
    status_mapping = {
        'active': 'Approved',
        'cancelled': 'Cancelled',
        'draft': 'Pending',
        'entered-in-error': 'Error'
    }
    
    return status_mapping.get(status, 'Pending')

def categorize_expense(eob: Dict) -> str:
    """Categorize expense based on EOB type and service"""
    # Check EOB type
    if 'type' in eob and 'coding' in eob['type']:
        coding = eob['type']['coding'][0]
        code = coding.get('code', '')
        
        if code == 'oral':
            return 'Dental'
        elif code == 'vision':
            return 'Vision'
        elif code == 'medical':
            return 'Medical'
    
    # Check service description
    service_desc = extract_service_description(eob).lower()
    
    if any(word in service_desc for word in ['dental', 'tooth', 'prophylaxis']):
        return 'Dental'
    elif any(word in service_desc for word in ['vision', 'eye', 'glasses']):
        return 'Vision'
    elif any(word in service_desc for word in ['medication', 'prescription']):
        return 'Prescription'
    else:
        return 'Medical'

def extract_patient_name(patient: Dict) -> str:
    """Extract patient name from patient resource"""
    if 'name' in patient and len(patient['name']) > 0:
        name = patient['name'][0]
        if 'given' in name and 'family' in name:
            return f"{' '.join(name['given'])} {name['family']}"
        elif 'text' in name:
            return name['text']
    
    return 'Unknown Patient'

def extract_currency(eob: Dict) -> str:
    """Extract currency from EOB"""
    # Check total section
    if 'total' in eob and len(eob['total']) > 0:
        total = eob['total'][0]
        if 'amount' in total and 'currency' in total['amount']:
            return total['amount']['currency']
    
    # Check item adjudication
    if 'item' in eob and len(eob['item']) > 0:
        item = eob['item'][0]
        if 'adjudication' in item and len(item['adjudication']) > 0:
            adj = item['adjudication'][0]
            if 'amount' in adj and 'currency' in adj['amount']:
                return adj['amount']['currency']
    
    return 'USD'

def transform_patient_data(patient: Dict) -> Dict:
    """Transform patient FHIR resource to simplified format"""
    return {
        'id': patient.get('id'),
        'name': extract_patient_name(patient),
        'birth_date': patient.get('birthDate'),
        'gender': patient.get('gender'),
        'address': extract_address(patient),
        'phone': extract_phone(patient),
        'email': extract_email(patient)
    }

def extract_address(patient: Dict) -> Optional[str]:
    """Extract patient address"""
    if 'address' in patient and len(patient['address']) > 0:
        addr = patient['address'][0]
        parts = []
        
        if 'line' in addr:
            parts.extend(addr['line'])
        if 'city' in addr:
            parts.append(addr['city'])
        if 'state' in addr:
            parts.append(addr['state'])
        if 'postalCode' in addr:
            parts.append(addr['postalCode'])
        
        return ', '.join(parts) if parts else None
    
    return None

def extract_phone(patient: Dict) -> Optional[str]:
    """Extract patient phone number"""
    if 'telecom' in patient:
        for telecom in patient['telecom']:
            if telecom.get('system') == 'phone':
                return telecom.get('value')
    return None

def extract_email(patient: Dict) -> Optional[str]:
    """Extract patient email"""
    if 'telecom' in patient:
        for telecom in patient['telecom']:
            if telecom.get('system') == 'email':
                return telecom.get('value')
    return None
