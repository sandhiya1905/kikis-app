const { spawn } = require('child_process');
const { createSampleFiles } = require('./create-sample-files');
const { seedDatabase } = require('./seed-data');
const path = require('path');
const fs = require('fs');

class NovaLearnLauncher {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');
    
    // Check if Node.js is available
    try {
      const nodeVersion = await this.runCommand('node', ['--version']);
      console.log(`   ✅ Node.js: ${nodeVersion.trim()}`);
    } catch (error) {
      console.error('   ❌ Node.js not found. Please install Node.js 18+');
      return false;
    }

    // Check if MongoDB is running (if not using Docker)
    console.log('   ℹ️  MongoDB will be started via Docker');

    return true;
  }

  async runCommand(command, args, options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { 
        stdio: 'pipe',
        shell: true,
        ...options 
      });
      
      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${output}`));
        }
      });
    });
  }

  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    const services = [
      { name: 'Root', path: '.' },
      { name: 'Auth Service', path: 'services/auth-service' },
      { name: 'Content Service', path: 'services/content-service' }
    ];

    for (const service of services) {
      console.log(`   📦 Installing ${service.name} dependencies...`);
      try {
        await this.runCommand('npm', ['install'], { cwd: service.path });
        console.log(`   ✅ ${service.name} dependencies installed`);
      } catch (error) {
        console.error(`   ❌ Failed to install ${service.name} dependencies:`, error.message);
        return false;
      }
    }

    return true;
  }

  async startMongoDB() {
    console.log('🍃 Starting MongoDB with Docker...');
    
    try {
      // Check if Docker is available
      await this.runCommand('docker', ['--version']);
      
      // Start MongoDB container
      await this.runCommand('docker', [
        'run', '-d',
        '--name', 'nova-learn-mongodb',
        '--rm',
        '-p', '27017:27017',
        '-e', 'MONGO_INITDB_ROOT_USERNAME=admin',
        '-e', 'MONGO_INITDB_ROOT_PASSWORD=password123',
        '-e', 'MONGO_INITDB_DATABASE=nova_learn',
        'mongo:7.0'
      ]);
      
      console.log('   ✅ MongoDB container started');
      
      // Wait for MongoDB to be ready
      console.log('   ⏳ Waiting for MongoDB to be ready...');
      await this.sleep(5000);
      
      return true;
    } catch (error) {
      console.error('   ❌ Failed to start MongoDB:', error.message);
      console.log('   ℹ️  Please make sure Docker is installed and running');
      return false;
    }
  }

  async setupData() {
    console.log('🗃️  Setting up sample data...');
    
    try {
      // Create sample files
      createSampleFiles();
      
      // Wait a bit for MongoDB to be fully ready
      await this.sleep(2000);
      
      // Seed database
      await seedDatabase();
      
      return true;
    } catch (error) {
      console.error('   ❌ Failed to setup data:', error.message);
      return false;
    }
  }

  startService(name, command, args, cwd) {
    console.log(`🚀 Starting ${name}...`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    });

    process.stdout.on('data', (data) => {
      console.log(`[${name}] ${data.toString().trim()}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[${name}] ${data.toString().trim()}`);
    });

    process.on('close', (code) => {
      if (!this.isShuttingDown) {
        console.log(`[${name}] Process exited with code ${code}`);
      }
    });

    this.processes.push({ name, process });
    return process;
  }

  async startServices() {
    console.log('🚀 Starting NovaLearn services...');
    
    // Start Auth Service
    this.startService(
      'Auth Service',
      'npm',
      ['run', 'dev'],
      'services/auth-service'
    );

    // Wait a bit for auth service to start
    await this.sleep(3000);

    // Start Content Service
    this.startService(
      'Content Service',
      'npm',
      ['run', 'dev'],
      'services/content-service'
    );

    console.log('\n🎉 NovaLearn Platform is starting up!');
    console.log('\n🌐 Services will be available at:');
    console.log('   🔐 Auth Service: http://localhost:3001');
    console.log('   📚 Content Service: http://localhost:3002');
    console.log('   🔍 Search API: http://localhost:3002/api/search');
    console.log('\n📊 Health Checks:');
    console.log('   🔐 http://localhost:3001/health');
    console.log('   📚 http://localhost:3002/health');
    
    console.log('\n🔐 Sample Login Credentials:');
    console.log('   📧 john.doe@harvard.edu | 🔑 SecurePass123');
    console.log('   📧 jane.smith@stanford.edu | 🔑 SecurePass123');
    console.log('   📧 mike.johnson@mit.edu | 🔑 SecurePass123');
    
    console.log('\n🧪 Quick API Tests:');
    console.log('   curl http://localhost:3001/health');
    console.log('   curl http://localhost:3002/health');
    console.log('   curl "http://localhost:3002/api/search?q=computer"');
    
    console.log('\n⏹️  Press Ctrl+C to stop all services');
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  setupGracefulShutdown() {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      
      console.log('\n🛑 Shutting down NovaLearn Platform...');
      
      // Kill all service processes
      this.processes.forEach(({ name, process }) => {
        console.log(`   🛑 Stopping ${name}...`);
        process.kill('SIGTERM');
      });

      // Stop MongoDB container
      try {
        console.log('   🛑 Stopping MongoDB container...');
        await this.runCommand('docker', ['stop', 'nova-learn-mongodb']);
        console.log('   ✅ MongoDB container stopped');
      } catch (error) {
        console.log('   ℹ️  MongoDB container was not running');
      }

      console.log('✅ NovaLearn Platform stopped successfully');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async launch() {
    console.log('🚀 NovaLearn Platform Launcher');
    console.log('================================\n');

    try {
      // Check prerequisites
      const prereqsOk = await this.checkPrerequisites();
      if (!prereqsOk) {
        process.exit(1);
      }

      // Install dependencies
      const depsOk = await this.installDependencies();
      if (!depsOk) {
        process.exit(1);
      }

      // Start MongoDB
      const mongoOk = await this.startMongoDB();
      if (!mongoOk) {
        process.exit(1);
      }

      // Setup sample data
      const dataOk = await this.setupData();
      if (!dataOk) {
        console.log('   ⚠️  Continuing without sample data...');
      }

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Start services
      await this.startServices();

    } catch (error) {
      console.error('❌ Failed to launch NovaLearn Platform:', error);
      process.exit(1);
    }
  }
}

// Launch the application
if (require.main === module) {
  const launcher = new NovaLearnLauncher();
  launcher.launch();
}

module.exports = NovaLearnLauncher;