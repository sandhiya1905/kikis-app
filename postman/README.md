# Postman API Testing for Nova Learn Platform

This directory contains a comprehensive Postman testing setup for the Nova Learn Platform, integrating seamlessly with your development workflow.

## 📁 Project Structure

```
postman/
├── README.md                    # This overview
├── SETUP.md                    # Quick setup guide
├── setup-postman.js           # Automated setup script
├── collections/
│   └── nova-learn-api.json    # Main API collection with tests
├── environments/
│   ├── local.json             # Local development environment
│   └── production.json        # Production environment
├── data/
│   └── test-data.json         # Test data and fixtures
├── scripts/
│   ├── test-runner.js         # Comprehensive test runner
│   └── integration.js         # Integration with Nova Learn services
└── docs/                      # Auto-generated API documentation
```

## 🚀 Quick Start

### 1. Setup Postman Integration
```bash
# Run the automated setup
npm run postman:setup

# Or run the full workflow
npm run workflow:postman
```

### 2. Run API Tests
```bash
# Run all tests
npm run test:api

# Run Postman tests only
npm run postman:test

# Run integration tests
npm run postman:integration
```

### 3. Generate Documentation
```bash
# Generate API docs from collections
npm run api:docs
```

## 🔧 Configuration

### Environment Variables
The system uses these environment variables:
- `POSTMAN_API_KEY` - Your Postman API key
- `NODE_ENV` - Environment (development/production)

### Service URLs (Local Development)
- **API Gateway**: http://localhost:3001
- **Auth Service**: http://localhost:3002  
- **Content Service**: http://localhost:3003

## 📋 Available Collections

### Nova Learn Platform API
Complete collection covering:

**Authentication Service**
- Health checks
- User registration with college verification
- User login with JWT tokens
- Token validation

**Content Service**
- Health checks
- Study material management
- File upload/download
- Search functionality

**API Gateway**
- Request routing
- Rate limiting
- Platform status

## 🧪 Testing Features

### Automated Test Scripts
- **Health Checks**: Verify all services are running
- **Authentication Flow**: Complete user registration and login
- **Content Management**: Upload, retrieve, and search materials
- **Error Handling**: Test error responses and edge cases

### Test Data Management
- Predefined test users and data
- Environment-specific configurations
- Automatic cleanup after tests

### Integration Testing
- Cross-service functionality
- End-to-end user workflows
- Performance and load testing

## 🔄 Automated Workflows

### Development Workflow
1. **Code Change Detection**: Hook triggers on file changes
2. **Service Validation**: Check if services are running
3. **Test Execution**: Run relevant test suites
4. **Result Reporting**: Generate test reports
5. **Documentation Update**: Auto-update API docs

### CI/CD Integration
- Pre-deployment testing
- Environment validation
- Automated regression testing
- Performance monitoring

## 📊 Reporting

### Test Reports
- Detailed test results with pass/fail status
- Performance metrics and response times
- Error logs and debugging information
- Trend analysis over time

### API Documentation
- Auto-generated from Postman collections
- Interactive examples and schemas
- Environment-specific endpoints
- Real-time updates

## 🛠️ Advanced Features

### Custom Test Scripts
Each request includes comprehensive test scripts:
- Response validation
- Data integrity checks
- Performance assertions
- Environment variable management

### Mock Server Integration
- Create mock APIs for development
- Test frontend without backend
- Simulate different scenarios
- Parallel development workflows

## 🔍 Troubleshooting

### Common Issues

**"Invalid API Key"**
- Set `POSTMAN_API_KEY` environment variable
- Verify key permissions in Postman dashboard

**"Service Not Found"**
- Check if services are running: `npm run dev`
- Verify service URLs in environment files

**"Tests Failing"**
- Check service health: `npm run postman:test`
- Review test logs in `postman/reports/`

### Debug Mode
```bash
# Run with verbose logging
DEBUG=postman* npm run test:api

# Check service status
npm run workflow:postman validate
```

## 🤝 Integration Points

### With Nova Learn Services
- **Auth Service**: User management and JWT validation
- **Content Service**: Study material CRUD operations
- **API Gateway**: Request routing and rate limiting
- **Database**: MongoDB integration testing

### With Development Tools
- **Kiro Hooks**: Automatic test triggering
- **Docker**: Container health checks
- **Git**: Pre-commit testing
- **CI/CD**: Automated deployment testing

## 📈 Metrics and Monitoring

### Performance Tracking
- Response time monitoring
- Throughput measurement
- Error rate tracking
- Service availability

### Quality Metrics
- Test coverage percentage
- API endpoint coverage
- Error handling completeness
- Documentation accuracy

## 🔮 Future Enhancements

- **Load Testing**: Stress test with multiple users
- **Security Testing**: Vulnerability scanning
- **Contract Testing**: API contract validation
- **Monitoring Integration**: Real-time alerting

---

**Generated by Nova Learn Platform Postman Integration**
*Last updated: ${new Date().toISOString()}*