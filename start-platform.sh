#!/bin/bash

echo "🚀 Starting NovaLearn Platform..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "📥 Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install Node.js with npm."
    exit 1
fi

echo "✅ Node.js and npm are available"
echo

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "services/auth-service/node_modules" ]; then
    echo "📦 Installing auth service dependencies..."
    cd services/auth-service
    npm install
    cd ../..
fi

if [ ! -d "services/content-service/node_modules" ]; then
    echo "📦 Installing content service dependencies..."
    cd services/content-service
    npm install
    cd ../..
fi

if [ ! -d "web/node_modules" ]; then
    echo "📦 Installing web dependencies..."
    cd web
    npm install
    cd ..
fi

echo
echo "🌐 Starting all services..."
echo

# Function to start a service in background
start_service() {
    local name=$1
    local dir=$2
    local script=$3
    local port=$4
    
    echo "Starting $name on port $port..."
    cd "$dir"
    nohup node "$script" > "../logs/${name,,}.log" 2>&1 &
    echo $! > "../logs/${name,,}.pid"
    cd - > /dev/null
    sleep 1
}

# Create logs directory
mkdir -p logs

# Start services
start_service "Auth Service" "services/auth-service" "src/app.js" "3001"
start_service "Content Service" "services/content-service" "src/app.js" "3002"
start_service "Web Server" "web" "server.js" "3000"

echo
echo "🎉 NovaLearn Platform is now running!"
echo
echo "📱 Access URLs:"
echo "   🏠 Main Website: http://localhost:3000"
echo "   📚 Study Materials: http://localhost:3000/study-materials.html"
echo "   🎓 Scholarships: http://localhost:3000/scholarships.html"
echo "   🤖 AI Assistant: http://localhost:3000/chatbot.html"
echo "   💼 Interview Prep: http://localhost:3000/interview-prep.html"
echo "   🚀 Enhanced AI Chat: http://localhost:3000/enhanced-chatbot.html"
echo
echo "🔧 API Services:"
echo "   🔐 Auth Service: http://localhost:3001"
echo "   📄 Content Service: http://localhost:3002"
echo
echo "💡 Tips:"
echo "   - Use './stop-platform.sh' to stop all services"
echo "   - Check logs in the 'logs' directory for any errors"
echo "   - Make sure MongoDB is running for full functionality"
echo
echo "🎯 Ready to learn with NovaLearn!"

# Create stop script
cat > stop-platform.sh << 'EOF'
#!/bin/bash

echo "🛑 Stopping NovaLearn Platform..."

# Function to stop a service
stop_service() {
    local name=$1
    local pidfile="logs/${name,,}.pid"
    
    if [ -f "$pidfile" ]; then
        local pid=$(cat "$pidfile")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Stopping $name (PID: $pid)..."
            kill "$pid"
            rm "$pidfile"
        else
            echo "$name was not running"
            rm -f "$pidfile"
        fi
    else
        echo "$name PID file not found"
    fi
}

# Stop all services
stop_service "Auth Service"
stop_service "Content Service"
stop_service "Web Server"

echo "✅ All services stopped"
EOF

chmod +x stop-platform.sh

echo
echo "📝 Log files are available in the 'logs' directory"
echo "🔄 Use './stop-platform.sh' to stop all services"