# NovaLearn Platform

A comprehensive web-based learning platform designed exclusively for college students to support academic learning, scholarship awareness, and interview preparation.

## Features

- **Student Authentication**: Secure registration and login with college credential verification
- **Study Materials**: Subject-wise notes and syllabus-based study materials with advanced search
- **Scholarship Discovery**: Updated scholarship information with eligibility matching
- **AI Interview Preparation**: AI-powered mock interviews with personalized feedback
- **Content Management**: Personal collections and recommendation system
- **Security & Privacy**: End-to-end encryption and role-based access control

## Architecture

The platform follows a microservices architecture with:

- **Frontend**: Flutter (Web & Mobile)
- **API Gateway**: Express.js with request routing and rate limiting
- **Authentication Service**: JWT-based authentication with bcrypt password hashing
- **Content Service**: File management with GridFS and search capabilities
- **Scholarship Service**: Eligibility matching and notification system
- **Interview Service**: Session management and progress tracking
- **AI Service**: Python-based NLP for question generation and answer evaluation
- **Database**: MongoDB with optimized indexes

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- MongoDB (or use Docker setup)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nova-learn-platform
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Using Docker (Recommended)**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   ```

4. **Manual Setup**
   ```bash
   # Install root dependencies
   npm install
   
   # Install service dependencies
   cd services/auth-service && npm install && cd ../..
   cd services/content-service && npm install && cd ../..
   cd services/scholarship-service && npm install && cd ../..
   cd services/interview-service && npm install && cd ../..
   cd api-gateway && npm install && cd ..
   
   # Install Python dependencies
   cd services/ai-service
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   cd ../..
   
   # Start MongoDB (if not using Docker)
   mongod
   
   # Start all services
   npm run dev
   ```

### API Endpoints

The API Gateway runs on `http://localhost:3000` and routes requests to:

- **Authentication**: `/api/auth/*` → Auth Service (Port 3001)
- **Content**: `/api/content/*` → Content Service (Port 3002)
- **Scholarships**: `/api/scholarships/*` → Scholarship Service (Port 3003)
- **Interviews**: `/api/interviews/*` → Interview Service (Port 3004)
- **AI**: `/api/ai/*` → AI Service (Port 5000)

### Testing

```bash
# Run all tests
npm test

# Run specific service tests
npm run test:auth
npm run test:content
npm run test:scholarship
npm run test:interview

# Run with coverage
npm run test:coverage
```

## Project Structure

```
nova-learn-platform/
├── api-gateway/                 # Express.js API Gateway
├── services/
│   ├── auth-service/           # Authentication & User Management
│   ├── content-service/        # Study Materials & Content
│   ├── scholarship-service/    # Scholarship Management
│   ├── interview-service/      # Interview Session Management
│   └── ai-service/            # Python NLP & AI Features
├── frontend/                   # Flutter Application (Future)
├── scripts/                    # Database & Setup Scripts
├── docker-compose.yml          # Docker Services Configuration
└── README.md

Each service contains:
├── src/
│   ├── controllers/           # Request handlers
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── services/             # Business logic
│   └── utils/                # Helper functions
├── tests/                    # Unit & Integration tests
├── Dockerfile               # Container configuration
└── package.json            # Dependencies & scripts
```

## Development Guidelines

### Code Style
- Use ESLint and Prettier for JavaScript/Node.js services
- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add JSDoc comments for functions

### Testing
- Write unit tests for all business logic
- Use property-based testing for critical algorithms
- Maintain minimum 80% code coverage
- Test error conditions and edge cases

### Security
- Never commit sensitive data or API keys
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`