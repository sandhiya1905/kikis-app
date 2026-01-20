/**
 * Test Postman Integration with Nova Learn Platform
 * Validates the complete setup and functionality
 */

const fs = require('fs');
const path = require('path');

class PostmanIntegrationTest {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      setup: false,
      files: false,
      config: false,
      scripts: false,
      integration: false
    };
  }

  testFileStructure() {
    console.log('📁 Testing file structure...');
    
    const requiredFiles = [
      '.postman.json',
      'postman/README.md',
      'postman/SETUP.md',
      'postman/setup-postman.js',
      'postman/collections/nova-learn-api.json',
      'postman/environments/local.json',
      'postman/environments/production.json',
      'postman/data/test-data.json',
      'postman/scripts/test-runner.js',
      'postman/scripts/integration.js',
      'scripts/postman-workflow.js',
      '.kiro/hooks/postman-auto-test.kiro.hook',
      '.kiro/settings/mcp.json'
    ];

    let allExist = true;
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      const exists = fs.existsSync(filePath);
      
      if (exists) {
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ❌ ${file} - Missing`);
        allExist = false;
      }
    }

    this.results.files = allExist;
    return allExist;
  }

  testConfiguration() {
    console.log('\n⚙️  Testing configuration files...');
    
    try {
      // Test .postman.json
      const postmanConfig = JSON.parse(fs.readFileSync(
        path.join(this.projectRoot, '.postman.json'), 'utf8'
      ));
      
      const hasWorkspace = postmanConfig.workspace && postmanConfig.workspace.name;
      const hasCollections = postmanConfig.collections && postmanConfig.collections.main;
      const hasEnvironments = postmanConfig.environments && 
                             postmanConfig.environments.local && 
                             postmanConfig.environments.production;
      
      console.log(`  ${hasWorkspace ? '✅' : '❌'} Workspace configuration`);
      console.log(`  ${hasCollections ? '✅' : '❌'} Collections configuration`);
      console.log(`  ${hasEnvironments ? '✅' : '❌'} Environments configuration`);
      
      // Test MCP configuration
      const mcpConfig = JSON.parse(fs.readFileSync(
        path.join(this.projectRoot, '.kiro/settings/mcp.json'), 'utf8'
      ));
      
      const hasPostmanServer = mcpConfig.mcpServers && mcpConfig.mcpServers.postman;
      console.log(`  ${hasPostmanServer ? '✅' : '❌'} MCP Postman server configured`);
      
      // Test collection structure
      const collection = JSON.parse(fs.readFileSync(
        path.join(this.projectRoot, 'postman/collections/nova-learn-api.json'), 'utf8'
      ));
      
      const hasAuthService = collection.item.some(item => item.name === 'Authentication Service');
      const hasContentService = collection.item.some(item => item.name === 'Content Service');
      const hasGateway = collection.item.some(item => item.name === 'API Gateway');
      
      console.log(`  ${hasAuthService ? '✅' : '❌'} Auth Service endpoints`);
      console.log(`  ${hasContentService ? '✅' : '❌'} Content Service endpoints`);
      console.log(`  ${hasGateway ? '✅' : '❌'} API Gateway endpoints`);
      
      this.results.config = hasWorkspace && hasCollections && hasEnvironments && 
                           hasPostmanServer && hasAuthService && hasContentService && hasGateway;
      
    } catch (error) {
      console.log(`  ❌ Configuration error: ${error.message}`);
      this.results.config = false;
    }

    return this.results.config;
  }

  testScripts() {
    console.log('\n🔧 Testing scripts...');
    
    try {
      // Test setup script
      const setupScript = require(path.join(this.projectRoot, 'postman/setup-postman.js'));
      console.log('  ✅ Setup script loads correctly');
      
      // Test test runner
      const testRunner = require(path.join(this.projectRoot, 'postman/scripts/test-runner.js'));
      console.log('  ✅ Test runner loads correctly');
      
      // Test integration script
      const integration = require(path.join(this.projectRoot, 'postman/scripts/integration.js'));
      console.log('  ✅ Integration script loads correctly');
      
      // Test workflow script
      const workflow = require(path.join(this.projectRoot, 'scripts/postman-workflow.js'));
      console.log('  ✅ Workflow script loads correctly');
      
      this.results.scripts = true;
      
    } catch (error) {
      console.log(`  ❌ Script error: ${error.message}`);
      this.results.scripts = false;
    }

    return this.results.scripts;
  }

  testPackageScripts() {
    console.log('\n📦 Testing package.json scripts...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(
        path.join(this.projectRoot, 'package.json'), 'utf8'
      ));
      
      const requiredScripts = [
        'postman:setup',
        'postman:test', 
        'postman:integration',
        'test:api',
        'api:docs',
        'workflow:postman'
      ];
      
      let allScriptsExist = true;
      
      for (const script of requiredScripts) {
        const exists = packageJson.scripts && packageJson.scripts[script];
        console.log(`  ${exists ? '✅' : '❌'} ${script}`);
        if (!exists) allScriptsExist = false;
      }
      
      this.results.setup = allScriptsExist;
      
    } catch (error) {
      console.log(`  ❌ Package.json error: ${error.message}`);
      this.results.setup = false;
    }

    return this.results.setup;
  }

  testEnvironmentVariables() {
    console.log('\n🌍 Testing environment setup...');
    
    const hasPostmanKey = process.env.POSTMAN_API_KEY;
    console.log(`  ${hasPostmanKey ? '✅' : '⚠️ '} POSTMAN_API_KEY ${hasPostmanKey ? 'set' : 'not set'}`);
    
    if (!hasPostmanKey) {
      console.log('    💡 Set with: set POSTMAN_API_KEY=your_api_key_here');
    }
    
    return !!hasPostmanKey;
  }

  generateReport() {
    console.log('\n📊 Integration Test Results');
    console.log('===========================');
    
    const tests = [
      { name: 'File Structure', result: this.results.files },
      { name: 'Configuration', result: this.results.config },
      { name: 'Scripts', result: this.results.scripts },
      { name: 'Package Scripts', result: this.results.setup }
    ];
    
    let passed = 0;
    
    for (const test of tests) {
      console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
      if (test.result) passed++;
    }
    
    const envReady = this.testEnvironmentVariables();
    
    console.log(`\nOverall: ${passed}/${tests.length} tests passed`);
    
    if (passed === tests.length && envReady) {
      console.log('\n🎉 Postman integration is fully configured and ready!');
      console.log('\nNext steps:');
      console.log('1. Start services: npm run dev');
      console.log('2. Run tests: npm run test:api');
      console.log('3. View results in postman/reports/');
    } else {
      console.log('\n⚠️  Setup incomplete. Please address the issues above.');
      
      if (!envReady) {
        console.log('\n🔑 Don\'t forget to set your POSTMAN_API_KEY!');
      }
    }
    
    // Save detailed report
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      environmentReady: envReady,
      overallStatus: passed === tests.length && envReady ? 'READY' : 'INCOMPLETE'
    };
    
    try {
      const reportPath = path.join(this.projectRoot, 'postman/reports');
      fs.mkdirSync(reportPath, { recursive: true });
      fs.writeFileSync(
        path.join(reportPath, 'integration-test.json'),
        JSON.stringify(report, null, 2)
      );
      console.log('\n📄 Detailed report saved to postman/reports/integration-test.json');
    } catch (error) {
      console.log('⚠️  Could not save report:', error.message);
    }
  }

  async runFullTest() {
    console.log('🧪 Nova Learn Platform - Postman Integration Test');
    console.log('=================================================\n');

    this.testFileStructure();
    this.testConfiguration();
    this.testScripts();
    this.testPackageScripts();
    this.generateReport();
  }
}

// Export for use
module.exports = PostmanIntegrationTest;

// Run if called directly
if (require.main === module) {
  const test = new PostmanIntegrationTest();
  test.runFullTest().catch(console.error);
}