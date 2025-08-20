import requests
import urllib.parse
import secrets
import json
from typing import Dict, Optional

class EpicOAuthHandler:
    def __init__(self, config: Dict):
        self.config = config
    
    def generate_state(self) -> str:
        """Generate a random state parameter for CSRF protection"""
        return secrets.token_urlsafe(32)
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Epic OAuth authorization URL"""
        params = {
            'response_type': 'code',
            'client_id': self.config['client_id'],
            'redirect_uri': self.config['redirect_uri'],
            'scope': self.config['scopes'],
            'state': state,
            'aud': self.config['fhir_base_url']
        }
        
        query_string = urllib.parse.urlencode(params)
        return f"{self.config['authorize_url']}?{query_string}"
    
    def exchange_code_for_token(self, auth_code: str) -> Dict:
        """Exchange authorization code for access token"""
        data = {
            'grant_type': 'authorization_code',
            'code': auth_code,
            'redirect_uri': self.config['redirect_uri'],
            'client_id': self.config['client_id']
        }
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        try:
            response = requests.post(
                self.config['token_url'], 
                data=data, 
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Token exchange failed: {e}")
            return {'error': str(e)}
    
    def validate_token_response(self, token_response: Dict) -> bool:
        """Validate the token response from Epic"""
        required_fields = ['access_token', 'token_type', 'expires_in']
        return all(field in token_response for field in required_fields)
    
    def get_token_info(self, token_response: Dict) -> Dict:
        """Extract useful information from token response"""
        return {
            'access_token': token_response.get('access_token'),
            'token_type': token_response.get('token_type'),
            'expires_in': token_response.get('expires_in'),
            'scope': token_response.get('scope'),
            'patient_id': token_response.get('patient'),
            'id_token': token_response.get('id_token')
        }
