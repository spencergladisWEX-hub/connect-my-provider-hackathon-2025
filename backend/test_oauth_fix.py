#!/usr/bin/env python3
"""
Test script to verify OAuth fix implementation
"""

import requests
import json
import time

def test_oauth_endpoints():
    """Test the OAuth endpoints to verify the fix"""
    
    base_url = "http://localhost:4000"
    
    print("🧪 Testing OAuth Fix Implementation")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Mock OAuth initiation
    print("\n2️⃣ Testing mock OAuth initiation...")
    try:
        response = requests.get(f"{base_url}/auth/epic")
        if response.status_code == 200:
            data = response.json()
            print("✅ Mock OAuth initiation passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
            print(f"   Patient ID: {data.get('patient_id')}")
            print(f"   Provider: {data.get('provider')}")
        else:
            print(f"❌ Mock OAuth initiation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Mock OAuth initiation error: {e}")
        return False
    
    # Test 3: Mock OAuth callback
    print("\n3️⃣ Testing mock OAuth callback...")
    try:
        response = requests.get(f"{base_url}/auth/callback")
        if response.status_code == 200:
            data = response.json()
            print("✅ Mock OAuth callback passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
        else:
            print(f"❌ Mock OAuth callback failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Mock OAuth callback error: {e}")
        return False
    
    # Test 4: Link account
    print("\n4️⃣ Testing link account...")
    try:
        payload = {"provider": "Trellis Healthcare"}
        response = requests.post(f"{base_url}/link-account", json=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Link account passed")
            print(f"   Status: {data.get('status')}")
            print(f"   Message: {data.get('message')}")
            print(f"   Provider: {data.get('provider')}")
            print(f"   Patient ID: {data.get('patient_id')}")
            print(f"   OAuth Status: {data.get('oauth_status')}")
        else:
            print(f"❌ Link account failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Link account error: {e}")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 All OAuth tests passed! The fix is working correctly.")
    print("=" * 50)
    
    return True

def test_configuration():
    """Test the configuration loading"""
    print("\n🔧 Testing Configuration...")
    print("=" * 30)
    
    try:
        from env_config import EPIC_CONFIG, DEMO_CONFIG
        
        print("✅ Configuration loaded successfully")
        print(f"   Client ID: {EPIC_CONFIG['client_id']}")
        print(f"   Redirect URI: {EPIC_CONFIG['redirect_uri']}")
        print(f"   Use Mock OAuth: {DEMO_CONFIG['use_mock_oauth']}")
        print(f"   Mock Patient ID: {DEMO_CONFIG['mock_patient_id']}")
        print(f"   Mock Provider: {DEMO_CONFIG['mock_provider_name']}")
        
        return True
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 OAuth Fix Verification Script")
    print("=" * 50)
    
    # Test configuration first
    if not test_configuration():
        print("❌ Configuration test failed. Exiting.")
        exit(1)
    
    # Test OAuth endpoints
    if test_oauth_endpoints():
        print("\n🎯 OAuth fix verification complete!")
        print("✅ Your demo should now work without OAuth errors.")
    else:
        print("\n❌ OAuth fix verification failed!")
        print("🔧 Please check the backend server and configuration.")
