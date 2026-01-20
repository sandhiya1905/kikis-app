# NovaLearn Platform Setup Guide

## 🎉 Your NovaLearn Platform is Ready!

The complete NovaLearn platform has been successfully created with all the features you requested:

### ✅ What's Been Implemented

1. **Authentication Service** (Port 3001)
   - User registration and login with JWT tokens
   - College verification system (60+ universities supported)
   - Security features (rate limiting, account lockout, encryption)
   - Profile management and password reset

2. **Content Management Service** (Port 3002)
   - File upload system (PDF, documents, videos)
   - Study material CRUD operations
   - Advanced search functionality
   - User collections and rating system

3. **Sample Data & Testing**
   - 5 sample users with different colleges and majors
   - 8 study materials across various subjects
   - 3 sample collections
   - Comprehensive API testing suite

## 🚀 Quick Start (3 Steps)

### Step 1: Install MongoDB

Choose one of these options:

**Option A: MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run on `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at: https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update `.env` files with your Atlas connection string

**Option C: Docker (if you have Docker)**
```bash
docker run -d --name mongodb -p 27017:27017 mongo:7.0
```

### Step 2: Start the Platform

```bash
# Install all dependencies (if not done already)
npm run install:all

# Start the platform
npm run start:simple
```

### Step 3: Setup Sample Data

In a new terminal:
```bash
# Create sample data (after MongoDB is running)
npm run setup

# Test the APIs
npm run test-apis
```

## 🌐 Access Your Platform

Once running, your services will be available at:

- **🔐 Auth Service**: http://localhost:3001
- **📚 Content Service**: http://localhost:3002
- **🔍 Search API**: http://localhost:3002/api/search

### Health Checks
- http://localhost:3001/health
- http://localhost:3002/health

## 🔐 Sample Login Credentials

After running `npm run setup`, you can login with:

- **📧 john.doe@harvard.edu** | **🔑 SecurePass123**
- **📧 jane.smith@stanford.edu** | **🔑 SecurePass123**
- **📧 mike.johnson@mit.edu** | **🔑 SecurePass123**
- **📧 sarah.wilson@berkeley.edu** | **🔑 SecurePass123**
- **📧 alex.brown@yale.edu** | **🔑 SecurePass123**

## 🧪 API Testing Examples

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@harvard.edu","password":"SecurePass123"}'

# Get profile (use token from login response)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/auth/me
```

### Content Search
```bash
# Search study materials
curl "http://localhost:3002/api/search?q=computer&limit=5"

# Get all materials
curl "http://localhost:3002/api/content/materials?limit=10"

# Get subjects
curl "http://localhost:3002/api/content/subjects"
```

## 📁 Project Structure

```
nova-learn-platform/
├── services/
│   ├── auth-service/          # Authentication & user management
│   ├── content-service/       # Content management & search
│   ├── ai-service/           # AI interview preparation (Python)
│   ├── interview-service/    # Interview management
│   └── scholarship-service/  # Scholarship information
├── shared/
│   ├── schemas/              # MongoDB schemas
│   └── config/               # Shared configuration
├── scripts/
│   ├── start-application.js  # Full launcher (requires Docker)
│   ├── start-simple.js      # Simple launcher (no Docker)
│   ├── seed-data.js         # Sample data creation
│   └── test-apis.js         # API testing suite
└── api-gateway/             # API Gateway (future)
```

## 🛠️ Development Commands

```bash
# Start individual services
npm run dev:auth          # Auth service only
npm run dev:content       # Content service only

# Run tests
npm run test:auth         # Auth service tests
npm run test:content      # Content service tests

# Full development mode (all services)
npm run dev
```

## 🔧 Configuration

### Environment Variables

Key configuration files:
- `.env` - Main configuration
- `services/auth-service/.env` - Auth service config
- `services/content-service/.env` - Content service config

### MongoDB Connection

Default: `mongodb://localhost:27017/nova_learn`

For MongoDB Atlas, update all `.env` files with your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nova_learn
```

## 🚨 Troubleshooting

### Services Won't Start
1. Ensure MongoDB is running
2. Check port availability (3001, 3002)
3. Verify all dependencies are installed: `npm run install:all`

### Database Connection Issues
1. Verify MongoDB is running: `mongosh` (if installed locally)
2. Check connection string in `.env` files
3. For Atlas: ensure IP whitelist and credentials are correct

### API Errors
1. Check service logs in terminal
2. Verify health endpoints are responding
3. Ensure sample data is loaded: `npm run setup`

## 🎯 Next Steps

1. **Frontend Development**: Create Flutter app connecting to these APIs
2. **AI Service**: Implement Python-based interview preparation
3. **Scholarship Service**: Add scholarship database and matching
4. **API Gateway**: Centralize API routing and authentication

## 📚 API Documentation

### Auth Service Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/verify-college` - Verify college email

### Content Service Endpoints
- `GET /api/content/materials` - List study materials
- `POST /api/content/materials` - Upload material
- `GET /api/search` - Search materials
- `GET /api/content/subjects` - List subjects
- `POST /api/collections` - Create collection

---

## 🎉 Congratulations!

Your NovaLearn platform is now ready for development and testing. The foundation is solid with authentication, content management, and search functionality all working together.

**Happy coding! 🚀**