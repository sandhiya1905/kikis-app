# 🚀 NovaLearn Platform - Build & Deployment Guide

Welcome to NovaLearn! This guide will help you build and run the complete learning platform with all its features.

## 🎯 What You'll Get

After following this guide, you'll have a fully functional learning platform with:

- **📚 Study Materials Management** - Upload, organize, and search study materials
- **🎓 Scholarship Discovery** - Find and track scholarship opportunities  
- **💼 Interview Preparation** - AI-powered mock interviews with feedback
- **🤖 Enhanced AI Assistant** - ChatGPT-like learning companion
- **🔐 User Authentication** - Secure login and user management
- **📊 Content Management** - Personal collections and recommendations

## 🛠️ Prerequisites

Before starting, make sure you have:

1. **Node.js** (version 16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **MongoDB** (optional but recommended)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud version)

3. **Git** (for cloning the repository)
   - Download from: https://git-scm.com/

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Recommended)

1. **Double-click** `start-platform.bat`
2. **Wait** for all services to start (about 30-60 seconds)
3. **Open** your browser to http://localhost:3000

That's it! The script will:
- Install all dependencies automatically
- Start all required services
- Open the platform in your browser

### Option 2: Manual Setup

If you prefer manual control:

```bash
# 1. Install root dependencies
npm install

# 2. Install service dependencies
cd services/auth-service && npm install && cd ../..
cd services/content-service && npm install && cd ../..
cd web && npm install && cd ..

# 3. Start services (in separate terminals)
# Terminal 1 - Auth Service
cd services/auth-service
node src/app.js

# Terminal 2 - Content Service  
cd services/content-service
node src/app.js

# Terminal 3 - Web Server
cd web
node server.js
```

## 🚀 Quick Start (Linux/Mac)

### Option 1: Automated Setup

```bash
# Make script executable
chmod +x start-platform.sh

# Run the platform
./start-platform.sh
```

### Option 2: Manual Setup

Same as Windows manual setup above.

## 📱 Access Your Platform

Once running, access these URLs:

| Feature | URL | Description |
|---------|-----|-------------|
| 🏠 **Main Website** | http://localhost:3000 | Landing page and dashboard |
| 📚 **Study Materials** | http://localhost:3000/study-materials.html | Browse and manage study content |
| 🎓 **Scholarships** | http://localhost:3000/scholarships.html | Find scholarship opportunities |
| 💼 **Interview Prep** | http://localhost:3000/interview-prep.html | AI-powered mock interviews |
| 🤖 **AI Assistant** | http://localhost:3000/chatbot.html | Basic AI chat helper |
| 🚀 **Enhanced AI Chat** | http://localhost:3000/enhanced-chatbot.html | **ChatGPT-like experience** |

### 🔧 API Services

| Service | URL | Purpose |
|---------|-----|---------|
| 🔐 **Auth Service** | http://localhost:3001 | User authentication |
| 📄 **Content Service** | http://localhost:3002 | Content management |

## 🎮 How to Use the Platform

### 1. **Getting Started**
- Visit http://localhost:3000
- Create an account or login
- Explore the different features

### 2. **Study Materials**
- Upload your study materials
- Search and filter by subject
- Create personal collections
- Get AI-powered recommendations

### 3. **Interview Preparation** ⭐ NEW!
- Choose interview type (Technical, Behavioral, Case Study)
- Set your field and experience level
- Practice with AI interviewer
- Get detailed feedback and improvement tips

### 4. **Enhanced AI Assistant** ⭐ NEW!
- ChatGPT-like conversational interface
- Code assistance with syntax highlighting
- Study planning and academic help
- Conversation history and quick prompts

### 5. **Scholarships**
- Browse available scholarships
- Filter by eligibility criteria
- Track application deadlines

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/novalearndb

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Service Ports
AUTH_SERVICE_PORT=3001
CONTENT_SERVICE_PORT=3002
WEB_SERVER_PORT=3000

# File Upload
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads

# AI Service (Optional)
OPENAI_API_KEY=your-openai-api-key-here
```

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Database will be created automatically

#### Option 2: MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🛠️ Development

### Project Structure

```
nova-learn-platform/
├── 📁 services/
│   ├── 📁 auth-service/          # User authentication
│   ├── 📁 content-service/       # Content management
│   ├── 📁 material-management/   # Advanced material features
│   └── 📁 activity-tracking/     # User analytics
├── 📁 web/                       # Frontend application
│   ├── index.html               # Main landing page
│   ├── study-materials.html     # Study materials page
│   ├── scholarships.html        # Scholarships page
│   ├── interview-prep.html      # 🆕 Interview preparation
│   ├── enhanced-chatbot.html    # 🆕 Enhanced AI assistant
│   └── chatbot.html            # Basic AI assistant
├── 📁 shared/                    # Shared schemas and utilities
├── 📁 scripts/                   # Build and utility scripts
└── 📁 postman/                   # API testing collections
```

### Adding New Features

1. **Backend Services**: Add to `services/` directory
2. **Frontend Pages**: Add to `web/` directory  
3. **Shared Code**: Add to `shared/` directory
4. **Database Models**: Add to `shared/schemas/`

### Testing

```bash
# Run all tests
npm test

# Run specific service tests
npm run test:auth
npm run test:content

# Run with coverage
npm run test:coverage
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process-id> /F

# Kill process (Linux/Mac)
kill -9 <process-id>
```

#### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity for Atlas

#### Dependencies Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Service Not Starting
- Check logs in service directories
- Verify all dependencies are installed
- Ensure ports are available

### Getting Help

1. **Check Logs**: Look in service directories for error logs
2. **Verify Setup**: Ensure all prerequisites are installed
3. **Port Conflicts**: Make sure ports 3000, 3001, 3002 are available
4. **Database**: Verify MongoDB is running and accessible

## 🎯 Production Deployment

### Using Docker (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Production Setup

1. **Environment Setup**
   - Set production environment variables
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

2. **Database Setup**
   - Use MongoDB Atlas or dedicated MongoDB server
   - Configure backups and monitoring

3. **Service Deployment**
   - Use PM2 for process management
   - Configure load balancing
   - Set up monitoring and logging

## 🚀 New Features Highlights

### 💼 Interview Preparation System
- **Multiple Interview Types**: Technical, Behavioral, Case Study
- **Personalized Questions**: Based on your field and experience
- **Real-time Feedback**: AI-powered analysis and suggestions
- **Progress Tracking**: History of all interview sessions
- **Performance Metrics**: Detailed analytics and improvement areas

### 🤖 Enhanced AI Assistant
- **ChatGPT-like Interface**: Modern conversational UI
- **Code Syntax Highlighting**: Proper formatting for code blocks
- **Conversation History**: Save and resume conversations
- **Quick Prompts**: Pre-built prompts for common tasks
- **Smart Responses**: Context-aware AI responses
- **Copy & Regenerate**: Message actions for better UX

## 📈 What's Next?

The platform is designed to be extensible. Future enhancements could include:

- 🎥 Video content support
- 📊 Advanced analytics dashboard
- 🤝 Collaborative study groups
- 📱 Mobile app (React Native/Flutter)
- 🔍 Advanced search with AI
- 📧 Email notifications
- 🎨 Customizable themes

## 🎉 Success!

If you see this message in your browser, congratulations! 🎊

**NovaLearn Platform is now running successfully!**

You now have access to:
- ✅ Complete learning management system
- ✅ AI-powered interview preparation
- ✅ Enhanced ChatGPT-like assistant
- ✅ Study materials management
- ✅ Scholarship discovery
- ✅ User authentication system

**Happy Learning! 🚀📚**

---

*Need help? Check the troubleshooting section above or review the service logs for detailed error information.*