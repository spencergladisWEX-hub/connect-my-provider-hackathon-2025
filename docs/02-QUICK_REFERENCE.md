# ⚡ **Quick Reference - WEX BENEFITS Provider Connection**

## 🚨 **Critical Issues to Fix Immediately**

### **1. FHIR Scope Compliance - HIGH PRIORITY**
```sql
-- Add missing FHIR scopes to OAuth configurations
UPDATE provider_oauth_configs 
SET fhir_scopes = '["patient/*.read", "launch/patient", "offline_access", "openid", "fhirUser"]'
WHERE provider_key IN ('epic', 'cerner');
```

### **2. SMART Launch Context - HIGH PRIORITY**
```python
# Add SMART launch context for Epic/Cerner
if provider_config.get('smart_enabled') and launch_context:
    params['launch'] = launch_context
```

### **3. JWT Token Validation - MEDIUM PRIORITY**
```python
# Validate FHIR JWT tokens
def validate_fhir_token(token: str) -> dict:
    decoded = jwt.decode(token, options={"verify_signature": False})
    required_claims = ['iss', 'sub', 'aud', 'exp', 'iat']
    for claim in required_claims:
        if claim not in decoded:
            raise ValueError(f"Missing claim: {claim}")
    return decoded
```

### **4. Patient Context Validation - HIGH PRIORITY**
```python
# Validate patient-specific access
def validate_patient_access(connection_id: str, patient_id: str) -> bool:
    connection = get_connection(connection_id)
    return connection.fhir_patient_id == patient_id
```

---

## 🔧 **Quick Fixes**

### **Database Schema Updates**
```sql
-- Add FHIR-specific fields
ALTER TABLE provider_oauth_configs 
ADD COLUMN fhir_audience TEXT,
ADD COLUMN smart_enabled BOOLEAN DEFAULT false,
ADD COLUMN fhir_scopes JSONB DEFAULT '[]',
ADD COLUMN launch_context_required BOOLEAN DEFAULT false;

-- Add FHIR token validation fields
ALTER TABLE oauth_tokens 
ADD COLUMN fhir_patient_id VARCHAR(255),
ADD COLUMN fhir_launch_context TEXT,
ADD COLUMN token_claims JSONB,
ADD COLUMN jti VARCHAR(255);
```

### **Frontend Issues**
```javascript
// Fix loading spinner animation
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

// Fix dynamic provider names in success modal
function updateProviderDisplay() {
    const connectedProviderName = document.getElementById('connectedProviderName');
    if (connectedProviderName) {
        connectedProviderName.textContent = provider.name;
    }
}
```

---

## 📋 **Development Checklists**

### **Before Starting New Features**
- [ ] **Check FHIR compliance** requirements
- [ ] **Validate security implications**
- [ ] **Update documentation** if needed
- [ ] **Add tests** for new functionality

### **Before Deploying**
- [ ] **Run security tests** for OAuth flows
- [ ] **Validate FHIR scopes** are correct
- [ ] **Check patient context** validation
- [ ] **Verify audit logging** is working

### **After Deploying**
- [ ] **Monitor OAuth success rates**
- [ ] **Check for JWT validation errors**
- [ ] **Verify patient data access** is correct
- [ ] **Review audit logs** for compliance

---

## 🛡️ **Security Reminders**

### **Never Do This**
- ❌ **Hardcode secrets** in code
- ❌ **Trust user input** without validation
- ❌ **Expose system details** in error messages
- ❌ **Bind to 0.0.0.0** in production
- ❌ **Skip JWT validation** for FHIR tokens

### **Always Do This**
- ✅ **Encrypt sensitive data** at rest
- ✅ **Validate OAuth state** parameters
- ✅ **Check patient context** before data access
- ✅ **Log all security events** for audit
- ✅ **Use HTTPS** in production

---

## 🔍 **Debugging Tools**

### **Frontend Console Commands**
```javascript
// Check modal status
devHelpers.checkModals()

// Check portal elements
devHelpers.checkPortalElements()

// Emergency reset
devHelpers.resetPortal()

// Test specific modal
devHelpers.testModal('termsModal')
```

### **Backend Health Checks**
```bash
# Check backend health
curl http://localhost:4000/health

# Check frontend
curl -I http://localhost:3000

# Check database connection
psql -d wex_benefits -c "SELECT 1;"
```

---

## 🚀 **Deployment Commands**

### **Development Setup**
```bash
# Start backend
cd backend && python3 server.py &

# Start frontend
cd frontend && python3 -m http.server 3000 &

# Check health
curl http://localhost:4000/health
```

### **Production Deployment**
```bash
# Database migration
psql -d wex_benefits -f docs/05-DATABASE_SCHEMA.sql

# Environment setup
export FLASK_ENV=production
export DATABASE_URL=postgresql://prod_host/wex_prod
export JWT_SECRET=secure_jwt_secret

# Start services
./start_demo.sh
```

---

## 🎯 **Immediate Next Steps**

### **This Sprint**
1. **Fix FHIR scope compliance** - Add missing scopes
2. **Implement SMART launch context** - For Epic/Cerner
3. **Add JWT token validation** - Security enhancement
4. **Implement patient context validation** - Data protection

### **Next Sprint**
1. **Add FHIR audit events** - Compliance requirement
2. **Implement resource-level access control** - Security enhancement
3. **Add token introspection** - Advanced security
4. **Update database schema** - FHIR compliance

### **Future Releases**
1. **Provider expansion** - Add more healthcare providers
2. **Performance optimization** - Database and API improvements
3. **Advanced security features** - Penetration testing, monitoring
4. **Enterprise features** - Multi-tenant, advanced reporting

---

## 📞 **Getting Help**

### **For FHIR Issues**
- Review [03-FHIR_COMPLIANCE.md](03-FHIR_COMPLIANCE.md)
- Check [FHIR OAuth 2.0 Implementation Guide](http://hl7.org/fhir/oauth2/)
- Consult [SMART on FHIR documentation](http://docs.smarthealthit.org/)

### **For Security Issues**
- Review [01-DEVELOPER_GUIDE.md#security-considerations](01-DEVELOPER_GUIDE.md#security-considerations)
- Check [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
- Use [JWT.io](https://jwt.io/) for token debugging

### **For Development Issues**
- Review [01-DEVELOPER_GUIDE.md](01-DEVELOPER_GUIDE.md)
- Check console logs for debugging information
- Use `devHelpers` functions for frontend debugging

---

## ⚠️ **Emergency Procedures**

### **If OAuth Flow Breaks**
1. **Check provider configurations** in database
2. **Verify FHIR scopes** are correct
3. **Check JWT token validation**
4. **Review audit logs** for errors

### **If Security Breach Suspected**
1. **Immediately revoke all tokens**
2. **Check audit logs** for unauthorized access
3. **Validate patient context** for all connections
4. **Contact security team**

### **If Data Access Issues**
1. **Check patient context validation**
2. **Verify resource-level permissions**
3. **Review FHIR audit events**
4. **Check database connection**

---

*Last Updated: August 18, 2025*  
*For complete documentation, see [01-DEVELOPER_GUIDE.md](01-DEVELOPER_GUIDE.md)*
