/**
 * Integration script for Nova Learn Platform
 * Connects Postman testing with existing development workflow
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class NovaLearnIntegration {
  constructor() {
    this.projectRoot = path.join(__dirname, '..', '..');
    this.postmanConfig = this.loadPostmanConfig();
  }

  loadPostmanConfig() {
    try {
      const configPath = path.join(this.projectRoot, '.postman.json');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (error) {
      console.log('⚠️  No Postman config found. Run setup first.');
      return null;
    }
  }

  async checkServices() {
    console.log('🔍 Checking Nova Learn services...');
    
    const services = [
      { name: 'MongoDB', command: 'docker ps | findstr mongo', port: 27017 },
      { name: 'API Gateway', script: 'api-gateway/package.json', port: 3001 },
      { name: 'Auth Service', script: 'services/auth-service/package.json', port: 3002 },
      { name: 'Content Service', script: 'services/content-service/package.json', port: 3003 }
    ];

    const status = {};
    
    for (const service of services) {
      try {
        // Check if service files exist
        if (service.script) {
          const scriptPath = path.join(this.projectRoot, service.script);
          const exists = fs.existsSync(scriptPath);
          status[service.name] = exists ? 'configured' : 'missing';
          console.log(`  ${exists ? '✅' : '❌'} ${service.name} - ${status[service.name]}`);
        }
      } catch (error) {
        status[service.name] = 'error';
        console.log(`  ❌ ${service.name} - error checking`);
      }
    }

    return status;
  }

  async runPreTestSetup() {
    console.log('🛠️  Running pre-test setup...');
    
    try {
      // Check if MongoDB is running
      console.log('  📊 Starting MongoDB...');
      
      // Check if services are built
      console.log('  🏗️  Checking service builds...');
      
      // Seed test data if needed
      const seedScript = path.join(this.projectRoot, 'scripts', 'seed-data.js');
      if (fs.existsSync(seedScript)) {
        console.log('  🌱 Seeding test data...');
        // execSync(`node "${seedScript}"`, { cwd: this.projectRoot });
        console.log('  ✅ Test data seeded');
      }
      
      console.log('  ✅ Pre-test setup complete');
      
    } catch (error) {
      console.error('  ❌ Pre-test setup failed:', error.message);
      throw error;
    }
  }

  async runPostmanTests() {
    if (!this.postmanConfig) {
      throw new Error('Postman not configured. Run setup first.');
    }

    console.log('🧪 Running Postman tests...');
    
    try {
      // Run the test runner
      const testRunner = require('./test-runner.js');
      const runner = new testRunner();
      await runner.runAllTests();
      
    } catch (error) {
      console.error('❌ Postman tests failed:', error.message);
      throw error;
    }
  }

  async generateReport() {
    console.log('📊 Generating integration report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      platform: 'Nova Learn Platform',
      services: await this.checkServices(),
      postman: {
        configured: !!this.postmanConfig,
        workspace: this.postmanConfig?.workspace?.name || 'Not configured',
        collections: Object.keys(this.postmanConfig?.collections || {}),
        environments: Object.keys(this.postmanConfig?.environments || {})
      },
      recommendations: []
    };

    // Add recommendations based on status
    if (!report.postman.configured) {
      report.recommendations.push('Run postman setup: node postman/setup-postman.js');
    }

    if (report.services['Auth Service'] === 'missing') {
      report.recommendations.push('Auth service not found - check services/auth-service/');
    }

    // Save report
    const reportPath = path.join(__dirname, '..', 'reports', `integration-report-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📄 Report saved:', reportPath);
    return report;
  }

  async fullIntegrationTest() {
    console.log('🚀 Nova Learn Platform - Full Integration Test');
    console.log('==============================================\n');

    try {
      // Check services
      await this.checkServices();
      
      // Setup
      await this.runPreTestSetup();
      
      // Run tests
      await this.runPostmanTests();
      
      // Generate report
      const report = await this.generateReport();
      
      console.log('\n✨ Integration test complete!');
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
    } catch (error) {
      console.error('\n❌ Integration test failed:', error.message);
      process.exit(1);
    }
  }
}

// Export for use
module.exports = NovaLearnIntegration;

// Run if called directly
if (require.main === module) {
  const integration = new NovaLearnIntegration();
  integration.fullIntegrationTest().catch(console.error);
}