import requests
from typing import Dict, List, Optional
import json

class EpicFHIRClient:
    def __init__(self, base_url: str, access_token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/fhir+json',
            'Content-Type': 'application/fhir+json'
        }
    
    def _make_request(self, url: str, params: Optional[Dict] = None) -> Dict:
        """Make HTTP request to FHIR endpoint"""
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"FHIR API request failed: {e}")
            return {'error': str(e)}
    
    def get_patient(self, patient_id: str) -> Dict:
        """Get patient demographics"""
        url = f"{self.base_url}/Patient/{patient_id}"
        return self._make_request(url)
    
    def get_explanation_of_benefits(self, patient_id: str) -> List[Dict]:
        """Get EOB resources for patient"""
        url = f"{self.base_url}/ExplanationOfBenefit"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_coverage(self, patient_id: str) -> List[Dict]:
        """Get coverage information"""
        url = f"{self.base_url}/Coverage"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_observations(self, patient_id: str) -> List[Dict]:
        """Get observations (labs, vitals, etc.)"""
        url = f"{self.base_url}/Observation"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_procedures(self, patient_id: str) -> List[Dict]:
        """Get procedures"""
        url = f"{self.base_url}/Procedure"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_medication_requests(self, patient_id: str) -> List[Dict]:
        """Get medication requests"""
        url = f"{self.base_url}/MedicationRequest"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_conditions(self, patient_id: str) -> List[Dict]:
        """Get conditions (diagnoses)"""
        url = f"{self.base_url}/Condition"
        params = {'patient': patient_id}
        response = self._make_request(url, params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
    
    def get_organization(self, org_id: str) -> Dict:
        """Get organization details"""
        url = f"{self.base_url}/Organization/{org_id}"
        return self._make_request(url)
    
    def get_practitioner(self, practitioner_id: str) -> Dict:
        """Get practitioner details"""
        url = f"{self.base_url}/Practitioner/{practitioner_id}"
        return self._make_request(url)
    
    def search_patients(self, search_params: Dict) -> List[Dict]:
        """Search for patients"""
        url = f"{self.base_url}/Patient"
        response = self._make_request(url, search_params)
        
        if 'entry' in response:
            return [entry['resource'] for entry in response['entry']]
        return []
