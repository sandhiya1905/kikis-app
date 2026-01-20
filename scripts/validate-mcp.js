// Validate MCP Configuration
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating MCP Configuration...\n');

try {
    // Check if file exists
    const mcpPath = path.join(process.cwd(), '..', '.kiro', 'settings', 'mcp.json');
    console.log('📁 Checking file:', mcpPath);
    
    if (!fs.existsSync(mcpPath)) {
        console.log('❌ MCP config file does not exist');
        return;
    }
    
    // Read and parse JSON
    const content = fs.readFileSync(mcpPath, 'utf8');
    console.log('📄 File content length:', content.length, 'bytes');
    
    if (content.trim() === '') {
        console.log('❌ File is empty');
        return;
    }
    
    const config = JSON.parse(content);
    console.log('✅ JSON is valid');
    console.log('📋 Configuration:');
    console.log(JSON.stringify(config, null, 2));
    
    // Check structure
    if (!config.mcpServers) {
        console.log('⚠️  Missing mcpServers property');
    } else {
        const serverCount = Object.keys(config.mcpServers).length;
        console.log(`🔧 Found ${serverCount} MCP server(s) configured`);
        
        Object.keys(config.mcpServers).forEach(serverName => {
            const server = config.mcpServers[serverName];
            console.log(`  - ${serverName}: ${server.disabled ? 'DISABLED' : 'ENABLED'}`);
        });
    }
    
    console.log('\n✅ MCP configuration is valid!');
    
} catch (error) {
    console.log('❌ Error validating MCP config:', error.message);
    
    if (error.message.includes('Unexpected end of JSON input')) {
        console.log('\n💡 This usually means:');
        console.log('   - File is truncated or corrupted');
        console.log('   - Missing closing braces');
        console.log('   - File encoding issues');
    }
}