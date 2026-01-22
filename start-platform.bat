@echo off
echo 🚀 Starting NovaLearn Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo 📥 Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available. Please install Node.js with npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

if not exist "services\auth-service\node_modules" (
    echo 📦 Installing auth service dependencies...
    cd services\auth-service
    npm install
    cd ..\..
)

if not exist "services\content-service\node_modules" (
    echo 📦 Installing content service dependencies...
    cd services\content-service
    npm install
    cd ..\..
)

if not exist "web\node_modules" (
    echo 📦 Installing web dependencies...
    cd web
    npm install
    cd ..
)

echo.
echo 🌐 Starting all services...
echo.

REM Start services in background
echo Starting Auth Service on port 3001...
start "Auth Service" cmd /k "cd services\auth-service && node src\app.js"

timeout /t 2 /nobreak >nul

echo Starting Content Service on port 3002...
start "Content Service" cmd /k "cd services\content-service && node src\app.js"

timeout /t 2 /nobreak >nul

echo Starting Web Server on port 3000...
start "Web Server" cmd /k "cd web && node server.js"

timeout /t 3 /nobreak >nul

echo.
echo 🎉 NovaLearn Platform is starting up!
echo.
echo 📱 Access URLs:
echo    🏠 Main Website: http://localhost:3000
echo    📚 Study Materials: http://localhost:3000/study-materials.html
echo    🎓 Scholarships: http://localhost:3000/scholarships.html
echo    🤖 AI Assistant: http://localhost:3000/chatbot.html
echo    💼 Interview Prep: http://localhost:3000/interview-prep.html
echo    🚀 Enhanced AI Chat: http://localhost:3000/enhanced-chatbot.html
echo.
echo 🔧 API Services:
echo    🔐 Auth Service: http://localhost:3001
echo    📄 Content Service: http://localhost:3002
echo.
echo 💡 Tips:
echo    - Close the service windows to stop the platform
echo    - Check each service window for logs and errors
echo    - Make sure MongoDB is running for full functionality
echo.
echo 🎯 Opening main website...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo.
echo ✅ Platform started successfully!
echo Press any key to exit this window...
pause >nul