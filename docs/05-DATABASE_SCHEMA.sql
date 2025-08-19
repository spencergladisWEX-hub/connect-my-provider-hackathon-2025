-- ========================================
-- FHIR-COMPLIANT OAUTH DATABASE SCHEMA
-- ========================================
-- 
-- This schema addresses FHIR-specific risks and compliance requirements:
-- 1. FHIR OAuth 2.0 Implementation Guide compliance
-- 2. SMART on FHIR launch context support
-- 3. JWT token validation and security
-- 4. Patient context validation
-- 5. FHIR resource-level access control
-- 6. FHIR-compliant audit events
-- 7. Healthcare compliance requirements
--
-- ========================================

-- Enable UUID extension for secure IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- PROVIDER MANAGEMENT (FHIR-ENHANCED)
-- ========================================

-- Healthcare providers that can be connected
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'trellis', 'epic', 'cerner'
    name VARCHAR(255) NOT NULL, -- e.g., 'Trellis Healthcare'
    display_name VARCHAR(255) NOT NULL, -- e.g., 'trellishealth'
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    fhir_base_url TEXT, -- FHIR server base URL
    smart_enabled BOOLEAN DEFAULT false, -- Supports SMART on FHIR
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    oauth_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FHIR-enhanced OAuth configurations
CREATE TABLE provider_oauth_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    oauth_version VARCHAR(10) NOT NULL DEFAULT '2.0', -- '1.0', '2.0', '2.1'
    client_id VARCHAR(255) NOT NULL,
    client_secret_hash VARCHAR(255) NOT NULL, -- Hashed, not plain text
    authorization_url TEXT NOT NULL,
    token_url TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    scope VARCHAR(500), -- OAuth scopes required
    fhir_scopes JSONB DEFAULT '[]', -- FHIR-specific scopes
    fhir_audience TEXT, -- FHIR server audience
    smart_enabled BOOLEAN DEFAULT false, -- Supports SMART on FHIR
    launch_context_required BOOLEAN DEFAULT false, -- Requires launch context
    state_parameter_required BOOLEAN DEFAULT true,
    pkce_required BOOLEAN DEFAULT false,
    additional_params JSONB, -- Provider-specific parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id)
);

-- Provider terms and conditions (versioned)
CREATE TABLE provider_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL, -- e.g., '1.0', '2.1'
    terms_text TEXT NOT NULL,
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider_id, version)
);

-- ========================================
-- CONSUMER MANAGEMENT
-- ========================================

-- WEX consumer accounts
CREATE TABLE consumers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wex_user_id VARCHAR(100) UNIQUE NOT NULL, -- WEX internal user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consumer sessions for OAuth flows (FHIR-enhanced)
CREATE TABLE consumer_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    provider_id UUID NOT NULL REFERENCES providers(id),
    oauth_state VARCHAR(255), -- OAuth state parameter
    pkce_code_verifier VARCHAR(255), -- PKCE code verifier if used
    launch_context VARCHAR(255), -- SMART launch context
    fhir_patient_id VARCHAR(255), -- FHIR patient ID for launch context
    redirect_url TEXT, -- Where to redirect after OAuth
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- OAUTH FLOW MANAGEMENT (FHIR-ENHANCED)
-- ========================================

-- OAuth authorization requests
CREATE TABLE oauth_authorizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    session_id UUID NOT NULL REFERENCES consumer_sessions(id) ON DELETE CASCADE,
    authorization_code VARCHAR(255), -- Provider's authorization code
    state VARCHAR(255), -- OAuth state parameter
    scope VARCHAR(500), -- Requested scopes
    fhir_scopes JSONB, -- FHIR-specific scopes requested
    launch_context VARCHAR(255), -- SMART launch context
    redirect_uri TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
    error_code VARCHAR(50), -- OAuth error code if failed
    error_description TEXT, -- OAuth error description
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- FHIR-enhanced OAuth tokens
CREATE TABLE oauth_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    authorization_id UUID NOT NULL REFERENCES oauth_authorizations(id) ON DELETE CASCADE,
    access_token_encrypted TEXT NOT NULL, -- Encrypted access token
    refresh_token_encrypted TEXT, -- Encrypted refresh token
    token_type VARCHAR(20) DEFAULT 'Bearer',
    expires_at TIMESTAMP WITH TIME ZONE,
    scope VARCHAR(500),
    fhir_scopes JSONB, -- FHIR scopes granted
    fhir_patient_id VARCHAR(255), -- FHIR patient ID
    fhir_launch_context TEXT, -- SMART launch context
    token_claims JSONB, -- JWT token claims (decoded)
    jti VARCHAR(255), -- JWT ID for replay protection
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- FHIR RESOURCE ACCESS CONTROL
-- ========================================

-- FHIR resource permissions
CREATE TABLE fhir_resource_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'Patient', 'Claim', 'Coverage', etc.
    patient_id VARCHAR(255), -- FHIR patient ID
    granted_scopes JSONB NOT NULL,
    access_level VARCHAR(20) DEFAULT 'read' CHECK (access_level IN ('read', 'write')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- PROVIDER CONNECTIONS (FHIR-ENHANCED)
-- ========================================

-- Active provider connections for consumers
CREATE TABLE provider_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    oauth_token_id UUID NOT NULL REFERENCES oauth_tokens(id),
    connection_name VARCHAR(255), -- User-friendly name for the connection
    fhir_patient_id VARCHAR(255), -- FHIR patient ID
    fhir_launch_context TEXT, -- SMART launch context
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error', 'expired')),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    next_sync_at TIMESTAMP WITH TIME ZONE,
    sync_frequency_minutes INTEGER DEFAULT 60, -- How often to sync
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(consumer_id, provider_id)
);

-- Terms acceptance tracking
CREATE TABLE terms_acceptances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id),
    terms_id UUID NOT NULL REFERENCES provider_terms(id),
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- ========================================
-- CLAIMS AND TRANSACTIONS (FHIR-ENHANCED)
-- ========================================

-- Provider claims/transactions with FHIR resource tracking
CREATE TABLE provider_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    provider_claim_id VARCHAR(255), -- Provider's internal claim ID
    fhir_resource_id VARCHAR(255), -- FHIR resource ID
    fhir_resource_type VARCHAR(50) DEFAULT 'Claim', -- FHIR resource type
    claim_type VARCHAR(50) NOT NULL, -- 'medical', 'dental', 'vision', etc.
    service_date DATE NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255),
    service_description TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    patient_responsibility DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'under_review')),
    verification_status VARCHAR(50) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'failed')),
    raw_data JSONB, -- Original provider data
    fhir_resource JSONB, -- FHIR resource data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- FHIR AUDIT AND COMPLIANCE
-- ========================================

-- FHIR-compliant audit events
CREATE TABLE fhir_audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES provider_connections(id) ON DELETE CASCADE,
    audit_event_resource JSONB NOT NULL, -- FHIR AuditEvent resource
    event_type VARCHAR(100) NOT NULL, -- 'read', 'write', 'delete', etc.
    resource_type VARCHAR(50), -- FHIR resource type
    patient_id VARCHAR(255), -- FHIR patient ID
    success BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for all OAuth and data access events
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID REFERENCES consumers(id),
    provider_id UUID REFERENCES providers(id),
    event_type VARCHAR(100) NOT NULL, -- 'oauth_initiated', 'oauth_completed', 'data_synced', etc.
    event_data JSONB, -- Detailed event information
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- HIPAA compliance logging
CREATE TABLE compliance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES consumers(id),
    provider_id UUID NOT NULL REFERENCES providers(id),
    action_type VARCHAR(100) NOT NULL, -- 'data_access', 'data_export', 'connection_created', etc.
    data_type VARCHAR(50), -- 'claims', 'demographics', 'clinical', etc.
    purpose VARCHAR(255), -- 'claim_verification', 'eligibility_check', etc.
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Provider indexes
CREATE INDEX idx_providers_key ON providers(provider_key);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_smart_enabled ON providers(smart_enabled);

-- Consumer indexes
CREATE INDEX idx_consumers_email ON consumers(email);
CREATE INDEX idx_consumers_wex_user_id ON consumers(wex_user_id);
CREATE INDEX idx_consumers_status ON consumers(status);

-- Session indexes
CREATE INDEX idx_consumer_sessions_token ON consumer_sessions(session_token);
CREATE INDEX idx_consumer_sessions_expires ON consumer_sessions(expires_at);
CREATE INDEX idx_consumer_sessions_consumer ON consumer_sessions(consumer_id);
CREATE INDEX idx_consumer_sessions_launch_context ON consumer_sessions(launch_context);

-- OAuth indexes
CREATE INDEX idx_oauth_authorizations_session ON oauth_authorizations(session_id);
CREATE INDEX idx_oauth_authorizations_status ON oauth_authorizations(status);
CREATE INDEX idx_oauth_authorizations_created ON oauth_authorizations(created_at);
CREATE INDEX idx_oauth_authorizations_launch_context ON oauth_authorizations(launch_context);

CREATE INDEX idx_oauth_tokens_consumer ON oauth_tokens(consumer_id);
CREATE INDEX idx_oauth_tokens_provider ON oauth_tokens(provider_id);
CREATE INDEX idx_oauth_tokens_status ON oauth_tokens(status);
CREATE INDEX idx_oauth_tokens_expires ON oauth_tokens(expires_at);
CREATE INDEX idx_oauth_tokens_jti ON oauth_tokens(jti);
CREATE INDEX idx_oauth_tokens_patient_id ON oauth_tokens(fhir_patient_id);

-- FHIR resource permissions indexes
CREATE INDEX idx_fhir_resource_permissions_connection ON fhir_resource_permissions(connection_id);
CREATE INDEX idx_fhir_resource_permissions_patient ON fhir_resource_permissions(patient_id);
CREATE INDEX idx_fhir_resource_permissions_resource_type ON fhir_resource_permissions(resource_type);

-- Connection indexes
CREATE INDEX idx_provider_connections_consumer ON provider_connections(consumer_id);
CREATE INDEX idx_provider_connections_provider ON provider_connections(provider_id);
CREATE INDEX idx_provider_connections_status ON provider_connections(status);
CREATE INDEX idx_provider_connections_next_sync ON provider_connections(next_sync_at);
CREATE INDEX idx_provider_connections_patient_id ON provider_connections(fhir_patient_id);

-- Claims indexes
CREATE INDEX idx_provider_claims_connection ON provider_claims(connection_id);
CREATE INDEX idx_provider_claims_status ON provider_claims(status);
CREATE INDEX idx_provider_claims_service_date ON provider_claims(service_date);
CREATE INDEX idx_provider_claims_verification ON provider_claims(verification_status);
CREATE INDEX idx_provider_claims_fhir_resource ON provider_claims(fhir_resource_id);

-- Audit indexes
CREATE INDEX idx_fhir_audit_events_connection ON fhir_audit_events(connection_id);
CREATE INDEX idx_fhir_audit_events_patient ON fhir_audit_events(patient_id);
CREATE INDEX idx_fhir_audit_events_type ON fhir_audit_events(event_type);
CREATE INDEX idx_fhir_audit_events_created ON fhir_audit_events(created_at);

CREATE INDEX idx_audit_logs_consumer ON audit_logs(consumer_id);
CREATE INDEX idx_audit_logs_provider ON audit_logs(provider_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update updated_at timestamp on row updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_oauth_configs_updated_at BEFORE UPDATE ON provider_oauth_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consumers_updated_at BEFORE UPDATE ON consumers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oauth_tokens_updated_at BEFORE UPDATE ON oauth_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_connections_updated_at BEFORE UPDATE ON provider_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_claims_updated_at BEFORE UPDATE ON provider_claims FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA INSERTION (FHIR-COMPLIANT)
-- ========================================

-- Insert sample providers with FHIR configuration
INSERT INTO providers (provider_key, name, display_name, description, logo_url, website_url, fhir_base_url, smart_enabled) VALUES
('trellis', 'Trellis Healthcare', 'trellishealth', 'Real-time healthcare data synchronization platform', 'https://example.com/trellis-logo.png', 'https://trellishealth.com', 'https://fhir.trellishealth.com', false),
('epic', 'Epic Systems', 'Epic MyChart', 'Comprehensive electronic health record system', 'https://example.com/epic-logo.png', 'https://epic.com', 'https://fhir.epic.com', true),
('cerner', 'Cerner Corporation', 'Cerner Health', 'Clinical and financial healthcare technology solutions', 'https://example.com/cerner-logo.png', 'https://cerner.com', 'https://fhir.cerner.com', true);

-- Insert FHIR-compliant OAuth configurations
INSERT INTO provider_oauth_configs (provider_id, client_id, client_secret_hash, authorization_url, token_url, redirect_uri, scope, fhir_scopes, fhir_audience, smart_enabled, launch_context_required, additional_params) 
SELECT 
    p.id,
    'wex_client_' || p.provider_key,
    'hashed_secret_' || p.provider_key, -- In production, use proper hashing
    CASE 
        WHEN p.provider_key = 'trellis' THEN 'https://auth.trellishealth.com/oauth/authorize'
        WHEN p.provider_key = 'epic' THEN 'https://fhir.epic.com/oauth2/authorize'
        WHEN p.provider_key = 'cerner' THEN 'https://authorization.cerner.com/oauth2/authorize'
    END,
    CASE 
        WHEN p.provider_key = 'trellis' THEN 'https://auth.trellishealth.com/oauth/token'
        WHEN p.provider_key = 'epic' THEN 'https://fhir.epic.com/oauth2/token'
        WHEN p.provider_key = 'cerner' THEN 'https://authorization.cerner.com/oauth2/token'
    END,
    'https://wex-benefits.com/oauth/callback',
    'patient/*.read launch/patient offline_access openid fhirUser',
    '["patient/*.read", "launch/patient", "offline_access", "openid", "fhirUser"]',
    p.fhir_base_url,
    p.smart_enabled,
    p.smart_enabled, -- Launch context required for SMART-enabled providers
    '{"aud": "' || p.fhir_base_url || '", "iss": "wex-benefits"}'
FROM providers p;

-- Insert sample terms
INSERT INTO provider_terms (provider_id, version, terms_text, effective_date) 
SELECT 
    p.id,
    '1.0',
    CASE 
        WHEN p.provider_key = 'trellis' THEN 'Trellis Healthcare Terms and Conditions: Real-time data synchronization, automated eligibility checks, and instant claim processing.'
        WHEN p.provider_key = 'epic' THEN 'Epic Systems Terms and Conditions: MyChart integration, secure data transmission, and comprehensive health record access.'
        WHEN p.provider_key = 'cerner' THEN 'Cerner Corporation Terms and Conditions: PowerChart integration, secure clinical data access, and automated eligibility verification.'
    END,
    CURRENT_DATE
FROM providers p;

-- ========================================
-- VIEWS FOR COMMON QUERIES (FHIR-ENHANCED)
-- ========================================

-- Active provider connections with FHIR context
CREATE VIEW active_connections_fhir AS
SELECT 
    pc.id as connection_id,
    c.email as consumer_email,
    c.first_name,
    c.last_name,
    p.name as provider_name,
    p.display_name as provider_display_name,
    pc.status as connection_status,
    pc.fhir_patient_id,
    pc.fhir_launch_context,
    pc.last_sync_at,
    pc.next_sync_at,
    ot.status as token_status,
    ot.expires_at as token_expires_at,
    ot.fhir_scopes as granted_scopes
FROM provider_connections pc
JOIN consumers c ON pc.consumer_id = c.id
JOIN providers p ON pc.provider_id = p.id
JOIN oauth_tokens ot ON pc.oauth_token_id = ot.id
WHERE pc.status = 'active' AND ot.status = 'active';

-- FHIR resource permissions summary
CREATE VIEW fhir_permissions_summary AS
SELECT 
    pc.id as connection_id,
    p.name as provider_name,
    c.email as consumer_email,
    pc.fhir_patient_id,
    frp.resource_type,
    frp.access_level,
    frp.granted_scopes
FROM provider_connections pc
JOIN consumers c ON pc.consumer_id = c.id
JOIN providers p ON pc.provider_id = p.id
LEFT JOIN fhir_resource_permissions frp ON pc.id = frp.connection_id
WHERE pc.status = 'active';

-- FHIR audit events summary
CREATE VIEW fhir_audit_summary AS
SELECT 
    pc.id as connection_id,
    p.name as provider_name,
    c.email as consumer_email,
    fae.event_type,
    fae.resource_type,
    fae.patient_id,
    fae.success,
    fae.created_at
FROM fhir_audit_events fae
JOIN provider_connections pc ON fae.connection_id = pc.id
JOIN consumers c ON pc.consumer_id = c.id
JOIN providers p ON pc.provider_id = p.id
ORDER BY fae.created_at DESC;

-- ========================================
-- SECURITY AND COMPLIANCE NOTES
-- ========================================
--
-- FHIR-SPECIFIC SECURITY REQUIREMENTS:
-- 1. All FHIR tokens must be validated as JWTs with proper claims
-- 2. SMART launch context must be validated for SMART-enabled providers
-- 3. Patient context must be validated for all FHIR resource access
-- 4. FHIR audit events must be generated for all data access
-- 5. Resource-level permissions must be enforced
-- 6. JWT replay protection using jti (JWT ID)
-- 7. Token introspection for additional security validation
--
-- COMPLIANCE REQUIREMENTS:
-- 1. HIPAA audit requirements with FHIR AuditEvent resources
-- 2. FHIR OAuth 2.0 Implementation Guide compliance
-- 3. SMART on FHIR launch context support
-- 4. Patient data protection with context validation
-- 5. Comprehensive audit trails for healthcare compliance
-- 6. Data retention policies for FHIR audit events
-- 7. Backup and disaster recovery procedures
--
-- ========================================
