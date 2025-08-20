# 📚 WEX Benefits Portal - Documentation Hub

## 🎯 **Choose Your Path**

### **🚀 For Demo Users (Just want to see it work)**
- **[Quick Start Guide](01-DEVELOPER_GUIDE.md#quick-start)** - Get the demo running in 5 minutes
- **[Demo Flow](01-DEVELOPER_GUIDE.md#demo-flow)** - Understand what you'll see

### **👨‍💻 For Developers & Contributors**
- **[Development Guide](01-DEVELOPER_GUIDE.md)** - Complete development workflow
- **[Architecture Overview](ARCHITECTURE.md)** - System design and components
- **[API Reference](02-API_REFERENCE.md)** - Backend endpoints and data structures
- **[Testing Guide](05-TESTING.md)** - How to test and validate changes

### **🔍 For Code Reviewers**
- **[Code Review Guide](../frontend/CODE_REVIEW_GUIDE.md)** - **READ THIS FIRST!**
- **[Architecture Details](../frontend/ARCHITECTURE.md)** - Frontend architecture explanation
- **[Security Considerations](../frontend/SECURITY_CONSIDERATIONS.md)** - Security architecture

### **🏥 For Healthcare Integration**
- **[FHIR Compliance](03-FHIR_COMPLIANCE.md)** - Healthcare standards & compliance
- **[API Design](04-API_DESIGN.md)** - API endpoints & architecture
- **[Database Schema](05-DATABASE_SCHEMA.sql)** - Data structure

## 📋 **Quick Reference**

| Task | Document | Description |
|------|----------|-------------|
| **Start Demo** | [Quick Start](01-DEVELOPER_GUIDE.md#quick-start) | Get demo running in 5 minutes |
| **Understand Code** | [Code Review Guide](../frontend/CODE_REVIEW_GUIDE.md) | **CRITICAL for reviewers** |
| **Add Features** | [Development Guide](01-DEVELOPER_GUIDE.md) | Complete development workflow |
| **Test Changes** | [Testing Guide](05-TESTING.md) | Validation and testing procedures |
| **Deploy** | [Frontend README](../frontend/README.md) | Production deployment guide |

## 🚨 **Critical Information**

### **For Code Reviewers**
> **⚠️ CRITICAL: This project has a sophisticated architecture!**
> 
> **DO NOT review `frontend/index.html` (5,964 lines) - it's a development file!**
> 
> **✅ Review the production code in `frontend/dist/` directory instead**

### **Architecture Overview**
- **Development**: Single file for rapid iteration (`frontend/index.html`)
- **Production**: Clean, organized code (`frontend/dist/` directory)
- **Backend**: Python Flask API with FHIR integration
- **Documentation**: Organized by user type and task

## 🔄 **Recent Updates**

- **v2.0.0**: Complete documentation reorganization
- **v1.9.0**: Frontend architecture optimization
- **v1.8.0**: Security considerations documentation
- **v1.7.0**: Testing framework implementation

## 📞 **Need Help?**

1. **Start with this index** - Choose your path above
2. **Check troubleshooting** - [Troubleshooting Guide](TROUBLESHOOTING.md)
3. **Review architecture** - [Architecture Overview](ARCHITECTURE.md)
4. **Console debugging** - Use browser dev tools for frontend issues

---

**Remember**: This is a sophisticated development environment with clear separation between development and production code! 🚀