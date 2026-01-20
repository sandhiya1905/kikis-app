@echo off
echo 🚀 Setting up NovaLearn Platform for development...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11+ first.
    pause
    exit /b 1
)

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not installed. You can still run services manually.
    set DOCKER_AVAILABLE=false
) else (
    set DOCKER_AVAILABLE=true
)

echo ✅ Prerequisites check completed

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created. Please review and update the configuration.
)

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install service dependencies
echo 📦 Installing service dependencies...

for %%s in (auth-service content-service scholarship-service interview-service) do (
    echo Installing dependencies for %%s...
    cd services\%%s
    call npm install
    cd ..\..
)

REM Install API Gateway dependencies
echo 📦 Installing API Gateway dependencies...
cd api-gateway
call npm install
cd ..

REM Install Python dependencies for AI service
echo 🐍 Installing Python dependencies for AI service...
cd services\ai-service

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Download spaCy model
echo 📥 Downloading spaCy English model...
python -m spacy download en_core_web_sm

call venv\Scripts\deactivate.bat
cd ..\..

echo ✅ All dependencies installed successfully!

echo.
echo 🎉 Setup completed! Next steps:
echo.
echo 1. Review and update the .env file with your configuration
echo 2. Choose your preferred way to run the platform:
echo.

if "%DOCKER_AVAILABLE%"=="true" (
    echo    Option A - Using Docker (Recommended):
    echo    docker-compose up -d
    echo.
)

echo    Option B - Manual startup:
echo    npm run dev
echo.
echo 3. The API Gateway will be available at http://localhost:3000
echo 4. Individual services run on ports 3001-3004 and 5000
echo.
echo 📚 Check README.md for detailed documentation
echo 🧪 Run 'npm test' to execute the test suite

pause