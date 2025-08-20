#!/usr/bin/env python3
"""
Debug Server Configuration
Shows exactly what the server is loading
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("🔍 Debugging Server Configuration")
print("=" * 50)

print(f"🔍 Current working directory: {os.getcwd()}")
print(f"🔍 .env file exists: {os.path.exists('.env')}")
print(f"🔍 EPIC_CLIENT_ID: {os.getenv('EPIC_CLIENT_ID')}")
print(f"🔍 EPIC_REDIRECT_URI: {os.getenv('EPIC_REDIRECT_URI')}")

# Import the config
print("\n🔍 Importing env_config...")
try:
    from env_config import EPIC_CONFIG
    print(f"🔍 EPIC_CONFIG['client_id']: {EPIC_CONFIG['client_id']}")
    print(f"🔍 EPIC_CONFIG['redirect_uri']: {EPIC_CONFIG['redirect_uri']}")
except Exception as e:
    print(f"❌ Error importing env_config: {e}")

# Test OAuth handler
print("\n🔍 Testing OAuth handler...")
try:
    from oauth_handler import EpicOAuthHandler
    oauth_handler = EpicOAuthHandler(EPIC_CONFIG)
    state = oauth_handler.generate_state()
    auth_url = oauth_handler.get_authorization_url(state)
    print(f"🔍 Generated auth URL: {auth_url}")
except Exception as e:
    print(f"❌ Error with OAuth handler: {e}")
