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
    
    // Only set up static middleware if we have a valid path
    if (staticPath) {
        app.use(express.static(staticPath, {
            index: 'index.html',
            maxAge: '1d',
            setHeaders: (res, path) => {
                if (path.endsWith('.html')) {
                    res.setHeader('Cache-Control', 'no-cache');
                }
            }
        }));
    }
} catch (error) {
    console.error('Error setting up static files:', error);
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'frontend',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    handleRequest(req, res);
});

// Catch all handler - send React app for any route
app.get('/*', (req, res) => {
    handleRequest(req, res);
});

function handleRequest(req, res) {
    if (staticPath && fs.existsSync(staticPath)) {
        const indexPath = path.join(staticPath, 'index.html');
        if (fs.existsSync(indexPath)) {
            res.sendFile(indexPath);
        } else {
            // Serve a temporary page if index.html doesn't exist
            res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ChefoodAI</title>
                    <style>
                        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .container { text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>ChefoodAI</h1>
                        <p>Service is starting up...</p>
                    </div>
                </body>
                </html>
            `);
        }
    } else {
        // Serve a temporary page if no build exists
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ChefoodAI</title>
                <style>
                    body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                    .container { text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>ChefoodAI</h1>
                    <p>Frontend deployment in progress...</p>
                </div>
            </body>
            </html>
        `);
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ChefoodAI - Error</title>
            <style>
                body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>ChefoodAI</h1>
                <p>An error occurred. Please try again later.</p>
            </div>
        </body>
        </html>
    `);
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
    // Keep the server running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    // Keep the server running
});