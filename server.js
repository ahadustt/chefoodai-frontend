/**
 * Production server for ChefoodAI Frontend
 * Serves the React build with proper Cloud Run configuration
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Get port from environment variable (Cloud Run requirement)
const PORT = process.env.PORT || 8080;

console.log('Starting ChefoodAI Frontend Server');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);

// Serve static files from the React build
const buildPath = path.join(__dirname, 'build');
const distPath = path.join(__dirname, 'dist');

// Check which build directory exists
let staticPath = null;

try {
    if (fs.existsSync(buildPath)) {
        staticPath = buildPath;
        console.log('Serving from build directory');
    } else if (fs.existsSync(distPath)) {
        staticPath = distPath;
        console.log('Serving from dist directory');
    } else {
        console.log('No build or dist directory found - will serve placeholder page');
        console.log('Available files:', fs.readdirSync(__dirname));
    }
} catch (error) {
    console.error('Error checking directories:', error);
}

// Health check endpoint - define this FIRST
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'frontend',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Ready check endpoint
app.get('/ready', (req, res) => {
    res.json({
        status: 'ready',
        service: 'frontend',
        staticPath: staticPath || 'none',
        timestamp: new Date().toISOString()
    });
});

// Serve static files if available
if (staticPath) {
    app.use(express.static(staticPath));
}

// Default handler for all routes - using middleware instead of wildcard route
app.use((req, res) => {
    if (staticPath && fs.existsSync(staticPath)) {
        const indexPath = path.join(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            res.send(getPlaceholderHTML('Service is starting up...'));
        }
    } else {
        res.send(getPlaceholderHTML('Frontend deployment in progress...'));
    }
});

// Helper function for placeholder HTML
function getPlaceholderHTML(message) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ChefoodAI</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .container { 
                    text-align: center;
                    background: white;
                    padding: 3rem;
                    border-radius: 10px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                h1 {
                    color: #333;
                    margin-bottom: 1rem;
                }
                p {
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🍳 ChefoodAI</h1>
                <p>${message}</p>
            </div>
        </body>
        </html>
    `;
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send(getPlaceholderHTML('An error occurred. Please try again later.'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Frontend server running on http://0.0.0.0:${PORT}`);
    console.log(`Serving static files from: ${staticPath || 'none (placeholder mode)'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        process.exit(0);
    });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    // Try to stay alive for health checks
    if (err.message && err.message.includes('path-to-regexp')) {
        console.log('Ignoring path-to-regexp error');
        return;
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
});