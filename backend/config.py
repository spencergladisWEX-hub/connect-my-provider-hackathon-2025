import os
from dotenv import load_dotenv

load_dotenv()

# Epic FHIR OAuth Configuration
EPIC_CONFIG = {
    'sandbox_base_url': 'https://fhir.epic.com/interconnect-fhir-oauth',
    'authorize_url': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/authorize',
    'token_url': 'https://fhir.epic.com/interconnect-fhir-oauth/oauth2/token',
    'fhir_base_url': 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4',
    'client_id': os.getenv('EPIC_CLIENT_ID', 'your-client-id-here'),
    'redirect_uri': os.getenv('EPIC_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
    'scopes': 'openid patient/*.read coverage/*.read explanationofbenefit/*.read observation/*.read procedure/*.read medicationrequest/*.read condition/*.read organization/*.read practitioner/*.read location/*.read appointment/*.read'
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
        'username': 'fhircamila',
        'password': 'epicepic1'
    },
    'provider': {
        'username': 'FHIRTWO',
        'password': 'EpicFhir11!'
    }
}
