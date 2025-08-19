# OAuth API Design - WEX BENEFITS Provider Connection

## 🎯 **OVERVIEW**

This document outlines the OAuth API design for the WEX BENEFITS provider connection system. The system supports dynamic OAuth flows where consumers authenticate directly with their healthcare provider's system through a web app that adapts based on the selected provider.

---

## 🔄 **OAUTH FLOW ARCHITECTURE**

### **1. Provider Selection & OAuth Initiation**
```
Consumer → WEX Portal → Provider Selection → OAuth Initiation → Provider OAuth Page
```

### **2. Provider Authentication**
```
Provider OAuth Page → Consumer Credentials → Provider System → Authorization Code
```

### **3. Token Exchange & Connection**
```
Authorization Code → WEX Backend → Access Token → Connection Established
```

---

## 📋 **API ENDPOINTS**

### **Provider Management**

#### **GET /api/providers**
Get list of available providers for connection.

**Response:**
```json
{
  "providers": [
    {
      "id": "uuid",
      "provider_key": "trellis",
      "name": "Trellis Healthcare",
      "display_name": "trellishealth",
      "description": "Real-time healthcare data synchronization platform",
      "logo_url": "https://example.com/trellis-logo.png",
      "website_url": "https://trellishealth.com",
      "oauth_enabled": true,
      "status": "active"
    }
  ]
}
```

#### **GET /api/providers/{provider_key}/oauth-config**
Get OAuth configuration for specific provider.

**Response:**
```json
{
  "provider_key": "trellis",
  "oauth_version": "2.0",
  "authorization_url": "https://auth.trellishealth.com/oauth/authorize",
  "token_url": "https://auth.trellishealth.com/oauth/token",
  "redirect_uri": "https://wex-benefits.com/oauth/callback",
  "scope": "patient/*.read launch/patient offline_access",
  "state_parameter_required": true,
  "pkce_required": false,
  "additional_params": {
    "aud": "https://fhir.epic.com",
    "iss": "wex-benefits"
  }
}
```

#### **GET /api/providers/{provider_key}/terms**
Get current terms and conditions for provider.

**Response:**
```json
{
  "provider_key": "trellis",
  "version": "1.0",
  "terms_text": "Trellis Healthcare Terms and Conditions...",
  "effective_date": "2024-01-01",
  "is_active": true
}
```

---

### **OAuth Flow Management**

#### **POST /api/oauth/initiate**
Initiate OAuth flow for selected provider.

**Request:**
```json
{
  "provider_key": "trellis",
  "consumer_id": "uuid",
  "redirect_url": "https://wex-benefits.com/dashboard"
}
```

**Response:**
```json
{
  "oauth_url": "https://auth.trellishealth.com/oauth/authorize?client_id=wex_client_trellis&redirect_uri=https://wex-benefits.com/oauth/callback&response_type=code&scope=patient/*.read&state=abc123",
  "session_token": "session_token_here",
  "expires_at": "2024-01-01T12:00:00Z"
}
```

#### **GET /api/oauth/callback**
Handle OAuth callback from provider.

**Query Parameters:**
- `code`: Authorization code from provider
- `state`: OAuth state parameter
- `error`: Error code (if failed)
- `error_description`: Error description (if failed)

**Response:**
```json
{
  "success": true,
  "connection_id": "uuid",
  "provider_name": "Trellis Healthcare",
  "status": "active"
}
```

#### **POST /api/oauth/token/refresh**
Refresh expired access token.

**Request:**
```json
{
  "connection_id": "uuid",
  "refresh_token": "encrypted_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_encrypted_access_token",
  "expires_at": "2024-01-01T12:00:00Z",
  "token_type": "Bearer"
}
```

---

### **Connection Management**

#### **GET /api/connections**
Get consumer's active provider connections.

**Response:**
```json
{
  "connections": [
    {
      "id": "uuid",
      "provider_name": "Trellis Healthcare",
      "provider_display_name": "trellishealth",
      "connection_name": "My Trellis Connection",
      "status": "active",
      "last_sync_at": "2024-01-01T10:00:00Z",
      "next_sync_at": "2024-01-01T11:00:00Z",
      "token_status": "active",
      "token_expires_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### **DELETE /api/connections/{connection_id}**
Disconnect provider connection.

**Response:**
```json
{
  "success": true,
  "message": "Connection successfully removed"
}
```

---

### **Claims & Data Management**

#### **GET /api/connections/{connection_id}/claims**
Get claims for specific provider connection.

**Response:**
```json
{
  "claims": [
    {
      "id": "uuid",
      "provider_claim_id": "TRELLIS_CLAIM_001",
      "claim_type": "medical",
      "service_date": "2024-01-01",
      "provider_name": "Downtown Dental Associates",
      "patient_name": "John Doe",
      "service_description": "Dental cleaning and examination",
      "total_amount": 150.00,
      "patient_responsibility": 25.00,
      "status": "pending",
      "verification_status": "unverified",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

#### **POST /api/connections/{connection_id}/sync**
Trigger manual sync for provider connection.

**Response:**
```json
{
  "success": true,
  "sync_id": "uuid",
  "claims_updated": 5,
  "last_sync_at": "2024-01-01T10:00:00Z"
}
```

---

## 🔐 **SECURITY IMPLEMENTATION**

### **Token Encryption**
```python
# Example encryption for OAuth tokens
from cryptography.fernet import Fernet
import base64

def encrypt_token(token: str, key: bytes) -> str:
    f = Fernet(key)
    encrypted = f.encrypt(token.encode())
    return base64.b64encode(encrypted).decode()

def decrypt_token(encrypted_token: str, key: bytes) -> str:
    f = Fernet(key)
    decoded = base64.b64decode(encrypted_token.encode())
    decrypted = f.decrypt(decoded)
    return decrypted.decode()
```

### **Session Management**
```python
# Secure session token generation
import secrets
import hashlib

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)

def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
```

### **OAuth State Validation**
```python
# Validate OAuth state parameter
def validate_oauth_state(state: str, session_id: str) -> bool:
    session = get_session(session_id)
    return session.oauth_state == state
```

---

## 🏗️ **DYNAMIC OAUTH IMPLEMENTATION**

### **Provider-Specific OAuth Configuration**

```python
class OAuthManager:
    def __init__(self, provider_key: str):
        self.provider_config = self.get_provider_config(provider_key)
    
    def build_authorization_url(self, session_token: str) -> str:
        """Build provider-specific OAuth authorization URL"""
        base_url = self.provider_config['authorization_url']
        params = {
            'client_id': self.provider_config['client_id'],
            'redirect_uri': self.provider_config['redirect_uri'],
            'response_type': 'code',
            'scope': self.provider_config['scope'],
            'state': session_token
        }
        
        # Add provider-specific parameters
        if self.provider_config.get('additional_params'):
            params.update(self.provider_config['additional_params'])
        
        # Add PKCE if required
        if self.provider_config.get('pkce_required'):
            code_verifier = self.generate_pkce_verifier()
            code_challenge = self.generate_pkce_challenge(code_verifier)
            params['code_challenge'] = code_challenge
            params['code_challenge_method'] = 'S256'
        
        return f"{base_url}?{urllib.parse.urlencode(params)}"
    
    def exchange_code_for_token(self, code: str, session_token: str) -> dict:
        """Exchange authorization code for access token"""
        token_url = self.provider_config['token_url']
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.provider_config['redirect_uri'],
            'client_id': self.provider_config['client_id'],
            'client_secret': self.decrypt_client_secret()
        }
        
        response = requests.post(token_url, data=data)
        return response.json()
```

### **Provider-Specific Authentication Pages**

```python
class ProviderAuthPage:
    def __init__(self, provider_key: str):
        self.provider_config = self.get_provider_config(provider_key)
    
    def render_auth_page(self, session_token: str) -> str:
        """Render provider-specific authentication page"""
        template_data = {
            'provider_name': self.provider_config['name'],
            'provider_logo': self.provider_config['logo_url'],
            'oauth_url': self.build_oauth_url(session_token),
            'terms_text': self.get_terms_text(),
            'provider_specific_fields': self.get_provider_fields()
        }
        
        return self.render_template('provider_auth.html', template_data)
    
    def get_provider_fields(self) -> dict:
        """Get provider-specific form fields"""
        if self.provider_config['provider_key'] == 'epic':
            return {
                'requires_launch_context': True,
                'supports_smart_launch': True,
                'additional_scopes': ['launch/patient']
            }
        elif self.provider_config['provider_key'] == 'cerner':
            return {
                'requires_launch_context': False,
                'supports_smart_launch': False,
                'additional_scopes': ['patient/*.read']
            }
        else:
            return {
                'requires_launch_context': False,
                'supports_smart_launch': False,
                'additional_scopes': []
            }
```

---

## 📊 **DATA FLOW DIAGRAM**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Consumer  │    │ WEX Portal  │    │   Provider  │    │   Database  │
│             │    │             │    │   System    │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Select        │                  │                  │
       │ Provider         │                  │                  │
       ├─────────────────►│                  │                  │
       │                  │                  │                  │
       │                  │ 2. Get OAuth     │                  │
       │                  │ Config           │                  │
       │                  ├────────────────────────────────────►│
       │                  │                  │                  │
       │                  │ 3. OAuth Config  │                  │
       │                  │ Response         │                  │
       │                  │◄────────────────────────────────────┤
       │                  │                  │                  │
       │                  │ 4. Build Auth    │                  │
       │                  │ URL              │                  │
       │                  │                  │                  │
       │                  │ 5. Redirect to   │                  │
       │                  │ Provider         │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │                  │
       │ 6. Provider      │                  │                  │
       │ Auth Page        │                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 7. Enter         │                  │                  │
       │ Credentials      │                  │                  │
       │                  │                  │                  │
       │ 8. Authorization │                  │                  │
       │ Code             │                  │                  │
       │────────────────────────────────────►│                  │
       │                  │                  │                  │
       │                  │ 9. Exchange Code │                  │
       │                  │ for Token        │                  │
       │                  ├─────────────────►│                  │
       │                  │                  │                  │
       │                  │ 10. Access Token │                  │
       │                  │ Response         │                  │
       │                  │◄─────────────────┤                  │
       │                  │                  │                  │
       │                  │ 11. Store Token  │                  │
       │                  │ & Create         │                  │
       │                  │ Connection       │                  │
       │                  ├────────────────────────────────────►│
       │                  │                  │                  │
       │                  │ 12. Connection   │                  │
       │                  │ Success          │                  │
       │                  │◄────────────────────────────────────┤
       │                  │                  │                  │
       │ 13. Redirect to  │                  │                  │
       │ Dashboard        │                  │                  │
       │◄─────────────────┤                  │                  │
       │                  │                  │                  │
```

---

## 🔄 **ERROR HANDLING**

### **OAuth Error Responses**
```json
{
  "error": "access_denied",
  "error_description": "User denied access to requested scopes",
  "state": "session_token_here"
}
```

### **API Error Responses**
```json
{
  "error": {
    "code": "OAUTH_AUTHORIZATION_FAILED",
    "message": "Failed to complete OAuth authorization",
    "details": {
      "provider": "trellis",
      "reason": "invalid_client_credentials"
    }
  }
}
```

---

## 📈 **SCALABILITY CONSIDERATIONS**

### **Database Scaling**
- **Read Replicas**: For high-read workloads (claims queries)
- **Connection Pooling**: For OAuth token management
- **Caching**: Redis for session management and OAuth state

### **API Scaling**
- **Load Balancing**: Multiple API instances
- **Rate Limiting**: Per-consumer and per-provider limits
- **Circuit Breakers**: For provider API calls

### **Security Scaling**
- **Key Rotation**: Regular OAuth client secret rotation
- **Token Refresh**: Automatic token refresh before expiration
- **Audit Logging**: Comprehensive audit trail for compliance

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Core OAuth Flow**
1. Database schema implementation
2. Basic OAuth flow for Trellis
3. Token storage and management
4. Connection status tracking

### **Phase 2: Provider Expansion**
1. Epic Systems integration
2. Cerner Corporation integration
3. Provider-specific OAuth configurations
4. Dynamic authentication pages

### **Phase 3: Advanced Features**
1. Automatic token refresh
2. Claims synchronization
3. Error handling and retry logic
4. Audit and compliance reporting

### **Phase 4: Production Readiness**
1. Security hardening
2. Performance optimization
3. Monitoring and alerting
4. Disaster recovery procedures

---

## 🎉 **CONCLUSION**

This OAuth API design provides a scalable, secure foundation for connecting consumers to multiple healthcare providers through dynamic OAuth flows. The database schema supports future expansion while maintaining security and compliance requirements.

**Key Benefits:**
- ✅ **Scalable architecture** for multiple providers
- ✅ **Secure token management** with encryption
- ✅ **Dynamic OAuth flows** based on provider selection
- ✅ **Comprehensive audit trails** for compliance
- ✅ **HIPAA-compliant** data handling
- ✅ **Future-ready** for additional providers
