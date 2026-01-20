# Postman Setup Guide

## Quick Setup

### 1. Get Postman API Key
1. Go to [postman.com](https://postman.com) and login
2. Go to Settings → API Keys
3. Create new API key named "Nova Learn Integration"
4. Copy the key

### 2. Set Environment Variable
```bash
# Windows Command Prompt
set POSTMAN_API_KEY=your_api_key_here

# Windows PowerShell  
$env:POSTMAN_API_KEY="your_api_key_here"

# Linux/Mac
export POSTMAN_API_KEY=your_api_key_here
```

### 3. Restart Kiro
Restart Kiro so it picks up the new environment variable.

### 4. Test Connection
Ask Kiro to test the Postman connection:
```
"Test my Postman connection and create the Nova Learn workspace"
```

## File Structure

```
postman/
├── README.md           # This file
├── SETUP.md           # Setup instructions  
├── setup-postman.js   # Setup script
├── run-tests.js       # Test runner
├── environments/      # Environment configs
│   ├── local.json
│   └── production.json
└── collections/       # Exported collections (auto-generated)
```

## Configuration Files

- `.postman.json` - Main configuration with IDs
- `.kiro/hooks/postman-auto-test.kiro.hook` - Auto-test hook
- `.kiro/settings/mcp.json` - MCP server configuration

## Usage

Once set up, the system will:
1. Auto-create workspace and collections
2. Run tests when you edit API code
3. Show test results and suggest fixes
4. Keep everything organized and synced

## Troubleshooting

**"Invalid API Key"** → Check environment variable is set correctly
**"Collection not found"** → Run setup to create collections first  
**"Tests failing"** → Make sure your services are running locally