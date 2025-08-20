#!/usr/bin/env python3
"""
EOB API Testing Script
Tests the two EOB APIs: ExplanationOfBenefit and Claim
"""

import requests
import json
import sys

def test_eob_apis():
    """Test EOB APIs with Epic sandbox"""
    
    print("🧪 Testing EOB APIs with Epic FHIR Sandbox")
    print("=" * 50)
    
    # Test patient IDs from Epic sandbox
    test_patients = {
        'camila_lopez': 'erXuFYUfucBZaryVksYEcMg3',
        'derrick_lin': 'eq081-VQEgP8drUUqCWzHfw3',
        'desiree_powell': 'eAB3mDIBBcyUKviyzrxsnAw3',
        'elijah_davis': 'egqBHVfQlt4Bw3XGXoxVxHg3',
        'linda_ross': 'eIXesllypH3M9tAA5WdJftQ3',
        'olivia_roberts': 'eh2xYHuzl9nkSFVvV3osUHg3',
        'warren_mcginnis': 'e0w0LEDCYtfckT6N.CkJKCw3'
    }
    
    # Epic FHIR base URL
    base_url = "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4"
    
    print("📋 Available test patients:")
    for name, patient_id in test_patients.items():
        print(f"  - {name}: {patient_id}")
    
    print("\n🔍 Testing ExplanationOfBenefit API...")
    print("-" * 30)
    
    # Test ExplanationOfBenefit API
    for name, patient_id in test_patients.items():
        print(f"\nTesting {name} ({patient_id}):")
        
        # Test ExplanationOfBenefit
        eob_url = f"{base_url}/ExplanationOfBenefit?patient={patient_id}"
        try:
            response = requests.get(eob_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('entry', []))
                print(f"  ✅ ExplanationOfBenefit: {count} records")
                if count > 0:
                    print(f"  📊 Sample EOB ID: {data['entry'][0]['resource'].get('id', 'unknown')}")
            else:
                print(f"  ❌ ExplanationOfBenefit: HTTP {response.status_code}")
        except Exception as e:
            print(f"  ❌ ExplanationOfBenefit: {e}")
        
        # Test Claim API
        claim_url = f"{base_url}/Claim?patient={patient_id}"
        try:
            response = requests.get(claim_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('entry', []))
                print(f"  ✅ Claim: {count} records")
                if count > 0:
                    print(f"  📊 Sample Claim ID: {data['entry'][0]['resource'].get('id', 'unknown')}")
            else:
                print(f"  ❌ Claim: HTTP {response.status_code}")
        except Exception as e:
            print(f"  ❌ Claim: {e}")
    
    print("\n" + "=" * 50)
    print("📊 SUMMARY:")
    print("1. ExplanationOfBenefit API - Primary EOB data source")
    print("2. Claim API - Fallback EOB data source")
    print("3. Both APIs should return claim/benefit data for expense tracking")
    print("\n🎯 Next Steps:")
    print("1. Register your Epic app with these APIs selected")
    print("2. Test OAuth flow with your Client ID")
    print("3. Verify expense tracker functionality")

if __name__ == "__main__":
    test_eob_apis()
