#!/usr/bin/env python3
"""
Debug OAuth Configuration
Shows exactly what redirect URI is being used
"""

from env_config import EPIC_CONFIG
from oauth_handler import EpicOAuthHandler

def debug_oauth():
    """Debug the OAuth configuration"""
    print("🔍 Debugging OAuth Configuration")
    print("=" * 50)
    
    print(f"🔍 Environment EPIC_REDIRECT_URI: {os.getenv('EPIC_REDIRECT_URI', 'NOT SET')}")
    print(f"🔍 EPIC_CONFIG['redirect_uri']: {EPIC_CONFIG['redirect_uri']}")
    print(f"🔍 EPIC_CONFIG['client_id']: {EPIC_CONFIG['client_id']}")
    
    # Test OAuth handler
    oauth_handler = EpicOAuthHandler(EPIC_CONFIG)
    state = oauth_handler.generate_state()
    auth_url = oauth_handler.get_authorization_url(state)
    
    print(f"\n🔍 Generated Authorization URL:")
    print(f"   {auth_url}")
    
    # Parse the URL to see the redirect_uri parameter
    if 'redirect_uri=' in auth_url:
        import urllib.parse
        parsed = urllib.parse.urlparse(auth_url)
        query_params = urllib.parse.parse_qs(parsed.query)
        redirect_uri = query_params.get('redirect_uri', ['NOT FOUND'])[0]
        print(f"\n🔍 Redirect URI in auth URL: {redirect_uri}")
        
        if redirect_uri == 'http://localhost:4000/auth/epic/callback':
            print("✅ Redirect URI is CORRECT!")
        else:
            print(f"❌ Redirect URI is WRONG! Expected: http://localhost:4000/auth/epic/callback")

if __name__ == "__main__":
    import os
    debug_oauth()
