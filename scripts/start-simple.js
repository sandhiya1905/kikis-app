const { spawn } = require('child_process');

class SimpleNovaLearnLauncher {
  constructor() {
    this.processes = [];
    this.isShuttingDown = false;
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    
    console.log('\n⚠️  MongoDB Setup Required:');
    console.log('   Please install MongoDB or use MongoDB Atlas');
    console.log('   Update .env files with your MongoDB connection string');
    console.log('   Default: mongodb://localhost:27017/nova_learn');
    
    console.log('\n🔐 Sample Login Credentials (after DB setup):');
    console.log('   📧 john.doe@harvard.edu | 🔑 SecurePass123');
    console.log('   📧 jane.smith@stanford.edu | 🔑 SecurePass123');
    console.log('   📧 mike.johnson@mit.edu | 🔑 SecurePass123');
    
    console.log('\n🧪 Quick API Tests:');
    console.log('   curl http://localhost:3001/health');
    console.log('   curl http://localhost:3002/health');
    
    console.log('\n⏹️  Press Ctrl+C to stop all services');
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

      console.log('✅ NovaLearn Platform stopped successfully');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  async launch() {
    console.log('🚀 NovaLearn Platform Simple Launcher');
    console.log('=====================================\n');

    try {
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
  const launcher = new SimpleNovaLearnLauncher();
  launcher.launch();
}

module.exports = SimpleNovaLearnLauncher;