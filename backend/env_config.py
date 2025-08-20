import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Epic FHIR OAuth Configuration
EPIC_CONFIG = {
    'sandbox_base_url': 'https://fhir.epic.com/interconnect-fhir-oauth',
    'authorize_url': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    'token_url': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    'fhir_base_url': 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    'client_id': os.getenv('EPIC_CLIENT_ID', '1c28b6d4-8195-4524-b780-2c9efa49f4db'),
    'redirect_uri': os.getenv('EPIC_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
    # FOCUSED SCOPES: Essential APIs for EOB and expense tracking
    'scopes': 'openid patient/*.read explanationofbenefit/*.read claim/*.read'
}

# Test patient IDs from Epic sandbox
TEST_PATIENTS = {
    'camila_lopez': 'erXuFYUfucBZaryVksYEcMg3',
    'derrick_lin': 'eq081-VQEgP8drUUqCWzHfw3',
    'desiree_powell': 'eAB3mDIBBcyUKviyzrxsnAw3',
    'elijah_davis': 'egqBHVfQlt4Bw3XGXoxVxHg3',
    'linda_ross': 'eIXesllypH3M9tAA5WdJftQ3',
    'olivia_roberts': 'eh2xYHuzl9nkSFVvV3osUHg3',
    'warren_mcginnis': 'e0w0LEDCYtfckT6N.CkJKCw3'
}

# Test user credentials
TEST_USERS = {
    'patient': {
        'username': os.getenv('EPIC_TEST_USERNAME', 'fhircamila'),
        'password': os.getenv('EPIC_TEST_PASSWORD', 'epicepic1')
    },
    'provider': {
        'username': 'FHIRTWO',
        'password': 'EpicFhir11!'
    }
}

# Demo configuration
DEMO_CONFIG = {
    'use_mock_oauth': True,  # Set to True to use mock OAuth for testing
    'mock_patient_id': 'erXuFYUfucBZaryVksYEcMg3',
    'mock_provider_name': 'Trellis Healthcare'
}
