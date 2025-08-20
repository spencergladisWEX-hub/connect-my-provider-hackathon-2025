const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Epic FHIR OAuth Configuration
const EPIC_CONFIG = {
    clientId: process.env.EPIC_CLIENT_ID,
    redirectUri: process.env.EPIC_REDIRECT_URI,
    authorizeUrl: process.env.EPIC_AUTHORIZE_URL,
    tokenUrl: process.env.EPIC_TOKEN_URL,
    fhirBaseUrl: process.env.EPIC_FHIR_BASE_URL,
    scopes: process.env.EPIC_SCOPES
};

// Debug: Log configuration values
console.log('🔍 Environment Variables Debug:');
console.log('🔍 EPIC_CLIENT_ID:', process.env.EPIC_CLIENT_ID);
console.log('🔍 EPIC_REDIRECT_URI:', process.env.EPIC_REDIRECT_URI);
console.log('🔍 EPIC_AUTHORIZE_URL:', process.env.EPIC_AUTHORIZE_URL);
console.log('🔍 EPIC_TOKEN_URL:', process.env.EPIC_TOKEN_URL);
console.log('🔍 EPIC_FHIR_BASE_URL:', process.env.EPIC_FHIR_BASE_URL);
console.log('🔍 EPIC_SCOPES:', process.env.EPIC_SCOPES);
console.log('🔍 EPIC_CONFIG:', EPIC_CONFIG);

// Test patient IDs from Epic sandbox
const TEST_PATIENTS = {
    'camila_lopez': 'erXuFYUfucBZaryVksYEcMg3',
    'derrick_lin': 'eq081-VQEgP8drUUqCWzHfw3',
    'desiree_powell': 'eAB3mDIBBcyUKviyzrxsnAw3',
    'elijah_davis': 'egqBHVfQlt4Bw3XGXoxVxHg3',
    'linda_ross': 'eIXesllypH3M9tAA5WdJftQ3',
    'olivia_roberts': 'eh2xYHuzl9nkSFVvV3osUHg3',
    'warren_mcginnis': 'e0w0LEDCYtfckT6N.CkJKCw3'
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'WEX FSA Provider Substantiation API',
        fhir_integration: 'enabled',
        epic_sandbox: 'configured',
        backend: 'nodejs'
    });
});

// Epic OAuth initiation endpoint
app.get('/auth/epic', (req, res) => {
    try {
        console.log('🔐 Initiating Epic OAuth flow...');
        
        // Generate state parameter for CSRF protection
        const state = crypto.randomBytes(32).toString('hex');
        req.session.oauthState = state;
        
        // Build OAuth authorization URL
        const authUrl = new URL(EPIC_CONFIG.authorizeUrl);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', EPIC_CONFIG.clientId);
        authUrl.searchParams.set('redirect_uri', EPIC_CONFIG.redirectUri);
        authUrl.searchParams.set('scope', EPIC_CONFIG.scopes);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('aud', EPIC_CONFIG.fhirBaseUrl);
        
        console.log('🔐 OAuth URL generated:', authUrl.toString());
        
        res.json({
            status: 'success',
            oauth_url: authUrl.toString(),
            message: 'OAuth URL generated for frontend'
        });
        
    } catch (error) {
        console.error('❌ OAuth initiation failed:', error);
        res.status(500).json({ error: 'OAuth initiation failed' });
    }
});

// Epic OAuth callback endpoint
app.get('/auth/epic/callback', async (req, res) => {
    try {
        const { code, state, error } = req.query;
        
        if (error) {
            console.error('❌ OAuth error from Epic:', error);
            return res.status(400).json({ error: `OAuth error: ${error}` });
        }
        
        if (!code || !state) {
            console.error('❌ Missing OAuth parameters');
            return res.status(400).json({ error: 'Missing OAuth parameters' });
        }
        
        // Validate state parameter
        if (state !== req.session.oauthState) {
            console.error('❌ Invalid OAuth state parameter');
            return res.status(400).json({ error: 'Invalid OAuth state' });
        }
        
        console.log('✅ OAuth callback received - Code:', code.substring(0, 10) + '...', 'State:', state);
        
        // Exchange authorization code for access token
        const tokenResponse = await exchangeCodeForToken(code);
        
        if (tokenResponse.error) {
            console.error('❌ Token exchange failed:', tokenResponse.error);
            return res.status(500).json({ error: 'Token exchange failed' });
        }
        
        // Store token info in session
        req.session.accessToken = tokenResponse.access_token;
        req.session.patientId = tokenResponse.patient || TEST_PATIENTS.camila_lopez;
        req.session.tokenExpires = Date.now() + (tokenResponse.expires_in * 1000);
        
        console.log('✅ OAuth successful - Patient ID:', req.session.patientId);
        
        // Redirect user back to frontend with success
        const frontendUrl = 'http://localhost:3000';
        const successUrl = `${frontendUrl}?oauth_success=true&patient_id=${req.session.patientId}&provider=Epic%20FHIR`;
        
        console.log('✅ OAuth successful - redirecting to frontend:', successUrl);
        
        res.redirect(successUrl);
        
    } catch (error) {
        console.error('❌ OAuth callback handling failed:', error);
        res.status(500).json({ error: 'OAuth callback failed' });
    }
});

// Exchange authorization code for access token
async function exchangeCodeForToken(authCode) {
    try {
        const tokenData = new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: EPIC_CONFIG.redirectUri,
            client_id: EPIC_CONFIG.clientId
        });
        
        const response = await axios.post(EPIC_CONFIG.tokenUrl, tokenData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000
        });
        
        return response.data;
        
    } catch (error) {
        console.error('Token exchange failed:', error.response?.data || error.message);
        return { error: error.response?.data || error.message };
    }
}

// FHIR data endpoint (placeholder for now)
app.get('/api/fhir/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const accessToken = req.session.accessToken;
        
        if (!accessToken) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // This would make actual FHIR API calls to Epic
        // For now, return mock data
        res.json({
            status: 'success',
            patient_id: patientId,
            message: 'FHIR data endpoint - implement actual Epic API calls here'
        });
        
    } catch (error) {
        console.error('FHIR data error:', error);
        res.status(500).json({ error: 'FHIR data request failed' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WEX FHIR Backend running on port ${PORT}`);
    console.log(`🔐 Epic OAuth configured with Client ID: ${EPIC_CONFIG.clientId}`);
    console.log(`🔗 Redirect URI: ${EPIC_CONFIG.redirectUri}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 OAuth endpoint: http://localhost:${PORT}/auth/epic`);
});
