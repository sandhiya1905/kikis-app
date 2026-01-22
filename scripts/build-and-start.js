#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting NovaLearn Platform Build and Deployment...\n');

// Check if required dependencies are installed
function checkDependencies() {
    console.log('📦 Checking dependencies...');
    
    const requiredDirs = [
        'node_modules',
        'services/auth-service/node_modules',
        'services/content-service/node_modules',
        'web/node_modules'
    ];
    
    const missingDeps = requiredDirs.filter(dir => !fs.existsSync(dir));
    
    if (missingDeps.length > 0) {
        console.log('❌ Missing dependencies. Installing...');
        return installDependencies();
    } else {
        console.log('✅ All dependencies found');
        return Promise.resolve();
    }
}

function installDependencies() {
    return new Promise((resolve, reject) => {
        console.log('📥 Installing root dependencies...');
        
        const install = spawn('npm', ['install'], { stdio: 'inherit' });
        
        install.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Root dependencies installed');
                installServiceDependencies().then(resolve).catch(reject);
            } else {
                reject(new Error('Failed to install root dependencies'));
            }
        });
    });
}

function installServiceDependencies() {
    const services = [
        'services/auth-service',
        'services/content-service',
        'web'
    ];
    
    return services.reduce((promise, service) => {
        return promise.then(() => {
            return new Promise((resolve, reject) => {
                console.log(`📥 Installing dependencies for ${service}...`);
                
                const install = spawn('npm', ['install'], {
                    cwd: service,
                    stdio: 'inherit'
                });
                
                install.on('close', (code) => {
                    if (code === 0) {
                        console.log(`✅ Dependencies installed for ${service}`);
                        resolve();
                    } else {
                        reject(new Error(`Failed to install dependencies for ${service}`));
                    }
                });
            });
        });
    }, Promise.resolve());
}

function startMongoDB() {
    return new Promise((resolve) => {
        console.log('🗄️  Starting MongoDB...');
        
        // Try to start MongoDB (this might fail if already running)
        const mongod = spawn('mongod', ['--dbpath', './data/db'], {
            stdio: 'pipe'
        });
        
        setTimeout(() => {
            console.log('✅ MongoDB should be running (or already was running)');
            resolve();
        }, 3000);
        
        mongod.on('error', () => {
            console.log('ℹ️  MongoDB might already be running or not installed locally');
            resolve();
        });
    });
}

function startServices() {
    console.log('🌐 Starting all services...\n');
    
    const services = [
        {
            name: 'Auth Service',
            command: 'node',
            args: ['src/app.js'],
            cwd: 'services/auth-service',
            port: 3001,
            color: '\x1b[32m' // Green
        },
        {
            name: 'Content Service',
            command: 'node',
            args: ['src/app.js'],
            cwd: 'services/content-service',
            port: 3002,
            color: '\x1b[34m' // Blue
        },
        {
            name: 'Web Server',
            command: 'node',
            args: ['server.js'],
            cwd: 'web',
            port: 3000,
            color: '\x1b[35m' // Magenta
        }
    ];
    
    services.forEach(service => {
        const process = spawn(service.command, service.args, {
            cwd: service.cwd,
            stdio: 'pipe'
        });
        
        process.stdout.on('data', (data) => {
            console.log(`${service.color}[${service.name}]\x1b[0m ${data.toString().trim()}`);
        });
        
        process.stderr.on('data', (data) => {
            console.log(`${service.color}[${service.name} ERROR]\x1b[0m ${data.toString().trim()}`);
        });
        
        process.on('close', (code) => {
            console.log(`${service.color}[${service.name}]\x1b[0m Process exited with code ${code}`);
        });
        
        console.log(`✅ Started ${service.name} on port ${service.port}`);
    });
    
    // Display access information
    setTimeout(() => {
        console.log('\n🎉 NovaLearn Platform is now running!\n');
        console.log('📱 Access URLs:');
        console.log('   🏠 Main Website: http://localhost:3000');
        console.log('   📚 Study Materials: http://localhost:3000/study-materials.html');
        console.log('   🎓 Scholarships: http://localhost:3000/scholarships.html');
        console.log('   🤖 AI Assistant: http://localhost:3000/chatbot.html');
        console.log('   💼 Interview Prep: http://localhost:3000/interview-prep.html');
        console.log('   🚀 Enhanced AI Chat: http://localhost:3000/enhanced-chatbot.html');
        console.log('\n🔧 API Services:');
        console.log('   🔐 Auth Service: http://localhost:3001');
        console.log('   📄 Content Service: http://localhost:3002');
        console.log('\n💡 Tips:');
        console.log('   - Use Ctrl+C to stop all services');
        console.log('   - Check the logs above for any errors');
        console.log('   - Make sure MongoDB is running for full functionality');
        console.log('\n🎯 Ready to learn with NovaLearn!');
    }, 2000);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down NovaLearn Platform...');
    process.exit(0);
});

// Main execution
async function main() {
    try {
        await checkDependencies();
        await startMongoDB();
        startServices();
    } catch (error) {
        console.error('❌ Error starting platform:', error.message);
        process.exit(1);
    }
}

main();