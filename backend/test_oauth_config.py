#!/usr/bin/env python3
"""
Test OAuth Configuration
Verifies that the Epic OAuth configuration is properly set up
"""

from env_config import EPIC_CONFIG
from oauth_handler import EpicOAuthHandler

def test_oauth_config():
    """Test the OAuth configuration"""
    print("🔐 Testing Epic OAuth Configuration")
    print("=" * 50)
    
    # Test configuration
    print(f"✅ Client ID: {EPIC_CONFIG['client_id']}")
    print(f"✅ Redirect URI: {EPIC_CONFIG['redirect_uri']}")
    print(f"✅ Scopes: {EPIC_CONFIG['scopes']}")
    print(f"✅ Authorize URL: {EPIC_CONFIG['authorize_url']}")
    print(f"✅ Token URL: {EPIC_CONFIG['token_url']}")
    print(f"✅ FHIR Base URL: {EPIC_CONFIG['fhir_base_url']}")
    
    # Test OAuth handler
    try:
        oauth_handler = EpicOAuthHandler(EPIC_CONFIG)
        state = oauth_handler.generate_state()
        auth_url = oauth_handler.get_authorization_url(state)
        
        print("\n✅ OAuth Handler initialized successfully")
        print(f"✅ Generated state: {state[:20]}...")
        print(f"✅ Authorization URL: {auth_url}")
        
        # Extract and verify client_id from the auth URL
        if 'client_id=' in auth_url:
            url_parts = auth_url.split('client_id=')
            if len(url_parts) > 1:
                client_id_part = url_parts[1].split('&')[0]
                print(f"✅ Client ID in auth URL: {client_id_part}")
                
                # Verify it matches our expected client ID
                expected_id = '4c5fe68b-3ef5-487c-a0e1-3515d37e51fd'
                if client_id_part == expected_id:
                    print("🎯 Client ID verification: PASSED ✅")
                else:
                    print(f"❌ Client ID verification: FAILED ❌")
                    print(f"   Expected: {expected_id}")
                    print(f"   Found:    {client_id_part}")
        
        print("\n🎯 OAuth Configuration Test: PASSED")
        print("Ready to start OAuth flow!")
        
    except Exception as e:
        print(f"\n❌ OAuth Handler test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_oauth_config()
