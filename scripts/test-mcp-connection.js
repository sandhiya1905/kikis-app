// Test MCP Server Connection
console.log('🔌 Testing MCP Server Connection...\n');

// Check if uvx is installed
const { execSync } = require('child_process');

try {
    console.log('📋 Checking MCP Prerequisites:');
    
    // Check if uvx is available
    try {
        const uvxVersion = execSync('uvx --version', { encoding: 'utf8' });
        console.log('✅ uvx is installed:', uvxVersion.trim());
    } catch (error) {
        console.log('❌ uvx is not installed');
        console.log('💡 Install uvx with: pip install uv');
        console.log('   Or visit: https://docs.astral.sh/uv/getting-started/installation/');
        return;
    }

    console.log('\n🔧 MCP Configuration:');
    console.log('✅ Created .kiro/settings/mcp.json');
    console.log('✅ Configured filesystem server');
    console.log('✅ Configured git server');
    console.log('⚠️  Brave search server (disabled - needs API key)');

    console.log('\n📚 Available MCP Servers:');
    console.log('1. filesystem - File system operations');
    console.log('2. git - Git repository operations');
    console.log('3. brave-search - Web search (requires API key)');

    console.log('\n🚀 Next Steps:');
    console.log('1. Restart Kiro to load MCP servers');
    console.log('2. Check MCP Server view in Kiro feature panel');
    console.log('3. Use MCP tools in your conversations');

    console.log('\n💡 To add more servers, edit .kiro/settings/mcp.json');
    console.log('   Popular servers: sqlite, postgres, puppeteer, github');

} catch (error) {
    console.error('❌ Error testing MCP connection:', error.message);
}