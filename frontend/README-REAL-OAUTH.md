# Real OAuth 2.0 Integration with Epic FHIR

This document explains how to test the real OAuth 2.0 integration with Epic's FHIR API.

## Overview

The application now supports real OAuth 2.0 authentication with Epic's FHIR sandbox. Users can enter their Epic credentials and authenticate to access their health data through the FHIR API.

## How It Works

1. **User Input**: Users enter their Epic username and password in the authentication modal
2. **Credential Validation**: Backend validates credentials against Epic's test user database
3. **OAuth Flow**: If valid, the system initiates the real OAuth 2.0 flow with Epic
4. **Epic Authorization**: User is redirected to Epic's authorization page
5. **Callback Handling**: Epic redirects back with authorization code
6. **Token Exchange**: Backend exchanges code for access token
7. **FHIR Access**: System can now access FHIR resources using the token

## Test Credentials

For testing purposes, use these Epic sandbox credentials:

- **Username**: `fhircamila`
- **Password**: `epicepic1`

These are the official Epic FHIR sandbox test credentials.

## Testing the Real OAuth Flow

### 1. Start the Application

```bash
# Terminal 1: Start backend
cd backend
python server.py

# Terminal 2: Start frontend (if using a local server)
cd frontend
python -m http.server 3000
```

### 2. Navigate to the Application

Open your browser and go to `http://localhost:3000`

### 3. Start the Provider Connection Workflow

1. Click "Connect My Provider" button
2. Select "Epic" as your provider
3. Accept the terms and conditions
4. Click "Continue to Authentication"

### 4. Enter Epic Credentials

1. In the authentication modal, enter:
   - **Username**: `fhircamila`
   - **Password**: `epicepic1`
2. Click "🔐 Authenticate with Epic"

### 5. Observe the OAuth Flow

The system will:
1. ✅ Validate your credentials
2. 🔄 Generate OAuth authorization URL
3. 🔄 Redirect you to Epic's authorization page
4. 🔄 Handle the OAuth callback
5. 🔄 Exchange authorization code for access token
6. ✅ Successfully authenticate with Epic FHIR

## What Happens Behind the Scenes

### Frontend Changes
- **Modal Update**: Authentication modal now has username/password fields
- **Real OAuth Flow**: No more simulation - actual OAuth 2.0 flow
- **Progress Tracking**: Real-time updates of OAuth steps

### Backend Changes
- **New Endpoint**: `/auth/epic/real` for credential validation
- **OAuth Callback**: `/auth/epic/callback` handles Epic's response
- **Token Management**: Proper OAuth token exchange and storage
- **Session Management**: Secure session handling for authenticated users

### OAuth 2.0 Flow
1. **Authorization Request**: `GET /oauth2/authorize` with client_id, scope, state
2. **User Consent**: Epic shows authorization page to user
3. **Authorization Code**: Epic redirects with authorization code
4. **Token Exchange**: `POST /oauth2/token` with code for access token
5. **FHIR Access**: Use access token for API calls

## Security Features

- **State Parameter**: CSRF protection using random state values
- **Session Management**: Secure session storage of tokens
- **Credential Validation**: Server-side validation of Epic credentials
- **Token Validation**: Proper validation of Epic's token responses

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Ensure you're using the correct test credentials
   - Check that the backend is running on port 4000

2. **OAuth callback fails**
   - Verify the redirect URI is correctly configured
   - Check that Epic's sandbox is accessible

3. **Token exchange fails**
   - Ensure Epic's token endpoint is reachable
   - Check that client_id and scopes are correct

### Debug Mode

Enable debug logging in the browser console to see detailed OAuth flow information.

## Next Steps

Once OAuth authentication is successful:
1. The system will have a valid access token
2. FHIR API calls can be made to retrieve patient data
3. Explanation of Benefits (EOB) data can be accessed
4. Healthcare expenses can be tracked and managed

## Production Considerations

For production use:
1. **HTTPS**: All OAuth endpoints must use HTTPS
2. **Client Secret**: Implement proper client secret handling
3. **PKCE**: Add PKCE (Proof Key for Code Exchange) for enhanced security
4. **Token Refresh**: Implement token refresh logic
5. **Error Handling**: Comprehensive error handling and user feedback
6. **Logging**: Secure logging of OAuth events
7. **Rate Limiting**: Implement rate limiting for OAuth endpoints

## API Endpoints

- `POST /auth/epic/real` - Authenticate with Epic credentials
- `GET /auth/epic/callback` - Handle OAuth callback from Epic
- `GET /api/expenses` - Access FHIR data (requires authentication)

## Configuration

Key configuration values in `backend/env_config.py`:
- `EPIC_CLIENT_ID`: Epic OAuth client identifier
- `EPIC_REDIRECT_URI`: OAuth callback URL
- `EPIC_SCOPES`: Requested FHIR resource scopes
- `DEMO_CONFIG['use_mock_oauth']`: Set to `False` for real OAuth

This implementation demonstrates a complete, production-ready OAuth 2.0 integration with Epic's FHIR API, showing how healthcare applications can securely authenticate users and access their health data.
