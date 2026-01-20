#!/bin/bash

# NovaLearn Platform Development Setup Script

echo "🚀 Setting up NovaLearn Platform for development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. You can still run services manually."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

echo "✅ Prerequisites check completed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update the configuration."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install service dependencies
echo "📦 Installing service dependencies..."

services=("auth-service" "content-service" "scholarship-service" "interview-service")
for service in "${services[@]}"; do
    echo "Installing dependencies for $service..."
    cd "services/$service"
    npm install
    cd "../.."
done

# Install API Gateway dependencies
echo "📦 Installing API Gateway dependencies..."
cd api-gateway
npm install
cd ..

# Install Python dependencies for AI service
echo "🐍 Installing Python dependencies for AI service..."
cd services/ai-service

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

# Download spaCy model
echo "📥 Downloading spaCy English model..."
python -m spacy download en_core_web_sm

deactivate
cd ../..

echo "✅ All dependencies installed successfully!"

# Setup instructions
echo ""
echo "🎉 Setup completed! Next steps:"
echo ""
echo "1. Review and update the .env file with your configuration"
echo "2. Choose your preferred way to run the platform:"
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "   Option A - Using Docker (Recommended):"
    echo "   docker-compose up -d"
    echo ""
fi

echo "   Option B - Manual startup:"
echo "   npm run dev"
echo ""
echo "3. The API Gateway will be available at http://localhost:3000"
echo "4. Individual services run on ports 3001-3004 and 5000"
echo ""
echo "📚 Check README.md for detailed documentation"
echo "🧪 Run 'npm test' to execute the test suite"