import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

// Create __filename and __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3005;

// Debug logging to understand the environment
console.log('Current directory:', __dirname);
console.log('Current working directory:', process.cwd());

// Define multiple possible locations for client files
const possibleClientPaths = [
  path.join(__dirname, '../client/dist'),          // Standard local development structure
  path.join(__dirname, 'client/dist'),             // Alternative structure
  path.join(process.cwd(), 'client/dist'),         // Based on working directory
  path.join(process.cwd(), '../client/dist'),      // Another possibility
  '/opt/render/project/src/client/dist',           // Render-specific path
  path.join(__dirname, '../../../client/dist'),       // Going up two levels
  path.join(__dirname, '../dist'),                 // If client is built to a parent dist folder
  path.join(__dirname, '../public')                // Common alternative name
];

// Find the first path that exists
let clientDistPath;
for (const testPath of possibleClientPaths) {
  console.log('Checking path:', testPath);
  if (fs.existsSync(testPath)) {
    clientDistPath = testPath;
    console.log('✅ Found client files at:', clientDistPath);
    break;
  }
}

if (!clientDistPath) {
  console.error('❌ Could not find client files in any expected location');
  // Default to the most likely path even if it doesn't exist yet
  clientDistPath = path.join(__dirname, '../client/dist');
  console.log('⚠️ Defaulting to:', clientDistPath);
}

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Serve static files from the client dist folder
app.use(express.static(clientDistPath));

// Handle client-side routing - send all other requests to index.html
app.get('*', (_req, res) => {
  // Check if index.html exists before sending it
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Client application not found. Please check build settings.');
  }
});

// Error handling middleware
interface Error {
  message: string;
  stack?: string;
}

interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});