const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the web directory
app.use(express.static(path.join(__dirname)));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'nova-learn-web' });
});

app.listen(PORT, () => {
    console.log(`🌐 NovaLearn Website running at: http://localhost:${PORT}`);
    console.log(`📱 Open your browser and visit: http://localhost:${PORT}`);
    console.log(`🔗 Make sure your backend services are running on ports 3001 and 3002`);
});