/**
 * Production server for ChefoodAI Frontend
 * Serves the React build with proper Cloud Run configuration
 */

const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();

// Get port from environment variable (Cloud Run requirement)
const PORT = process.env.PORT || 8000;

console.log('Starting ChefoodAI Frontend Server');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);

// Enable gzip compression
app.use(compression());

// Serve static files from the React build
const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');

// Check which build directory exists
const fs = require('fs');
let staticPath;

if (fs.existsSync(buildPath)) {
    staticPath = buildPath;
    console.log('Serving from build directory');
} else if (fs.existsSync(distPath)) {
    staticPath = distPath;
    console.log('Serving from dist directory');
} else {
    console.error('No build or dist directory found!');
    console.log('Available files:', fs.readdirSync(__dirname));
    // Fallback to serving from src for development
    staticPath = __dirname;
}

app.use(express.static(staticPath));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'frontend',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Catch all handler - send React app for any route
app.get('*', (req, res) => {
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({
            error: 'Frontend not built',
            message: 'Please build the React app first',
            staticPath: staticPath
        });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
    console.log(`Serving static files from: ${staticPath}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});