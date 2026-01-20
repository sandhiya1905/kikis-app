// Check MCP Connection Status
console.log('🔌 Checking MCP Connection Status...\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check prerequisites
console.log('📋 Prerequisites Check:');

try {
    // Check uvx
    try {
        const uvxVersion = execSync('uvx --version', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ uvx is installed:', uvxVersion.trim());
    } catch (error) {
        console.log('❌ uvx is NOT installed');
        console.log('💡 Install with: pip install uv');
        console.log('   Or visit: https://docs.astral.sh/uv/getting-started/installation/');
        return false;
    }

    // Check Python
    try {
        const pythonVersion = execSync('python --version', { encoding: 'utf8', stdio: 'pipe' });
        console.log('✅ Python is available:', pythonVersion.trim());
    } catch (error) {
        console.log('⚠️  Python not found in PATH');
    }

} catch (error) {
    console.log('❌ Error checking prerequisites:', error.message);
    return false;
}

// Check MCP configuration
console.log('\n🔧 MCP Configuration:');
try {
    const mcpPath = path.join(process.cwd(), '..', '.kiro', 'settings', 'mcp.json');
    
    if (fs.existsSync(mcpPath)) {
        const config = JSON.parse(fs.readFileSync(mcpPath, 'utf8'));
        console.log('✅ MCP config file exists and is valid');
        
        const servers = Object.keys(config.mcpServers || {});
        console.log(`📊 Configured servers: ${servers.length}`);
        
        servers.forEach(name => {
            const server = config.mcpServers[name];
            console.log(`   - ${name}: ${server.disabled ? '🔴 DISABLED' : '🟢 ENABLED'}`);
        });
    } else {
        console.log('❌ MCP config file not found');
        return false;
    }
} catch (error) {
    console.log('❌ Error reading MCP config:', error.message);
    return false;
}

// Test MCP server availability
console.log('\n🧪 Testing MCP Server Availability:');
try {
    // Test if mcp-server-filesystem is available
    const testResult = execSync('uvx mcp-server-filesystem --help', { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 10000 
    });
    console.log('✅ mcp-server-filesystem is available');
} catch (error) {
    console.log('❌ mcp-server-filesystem not available');
    console.log('💡 Install with: uvx install mcp-server-filesystem');
}

console.log('\n📱 Connection Status:');
console.log('To check if MCP is actually connected in Kiro:');
console.log('1. Look for "MCP Servers" in the Kiro feature panel');
console.log('2. Check if filesystem server shows as "Connected"');
console.log('3. Try using MCP tools in conversation');

return true;