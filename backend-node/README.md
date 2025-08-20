# WEX FHIR Backend (Node.js)

Epic FHIR OAuth 2.0 integration backend for WEX FSA Provider Substantiation.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
The `.env` file is already configured with:
- ✅ **Epic Client ID:** `4c5fe68b-3ef5-487c-a0e1-3515d37e51fd`
- ✅ **Redirect URI:** `http://localhost:4000/auth/epic/callback`
- ✅ **OAuth Scopes:** `openid patient/*.read explanationofbenefit/*.read`

### 3. Start the Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## 🔐 OAuth Flow

1. **Frontend calls:** `GET /auth/epic`
2. **Backend returns:** OAuth authorization URL
3. **Frontend opens:** Epic OAuth in new window
4. **Epic redirects to:** `/auth/epic/callback`
5. **Backend processes:** OAuth callback and token exchange
6. **Backend redirects to:** Frontend with success parameters

## 📡 API Endpoints

- **`GET /health`** - Health check
- **`GET /auth/epic`** - Initiate OAuth flow
- **`GET /auth/epic/callback`** - OAuth callback handler
- **`GET /api/fhir/patient/:patientId`** - FHIR data (placeholder)

## 🛠️ Development

- **Port:** 4000
- **CORS:** Enabled for `localhost:3000`
- **Sessions:** Express-session with JWT secret
- **HTTP Client:** Axios for Epic API calls

## 🔧 Configuration

All configuration is in the `.env` file:
- Epic OAuth credentials
- Server settings
- FHIR endpoints
- OAuth scopes

## 🎯 Benefits Over Python

- ✅ **No module conflicts** - Direct imports
- ✅ **Reliable env vars** - Better .env handling
- ✅ **Native async** - Promise-based OAuth
- ✅ **Consistent stack** - JavaScript throughout
- ✅ **Better debugging** - Clear error messages
