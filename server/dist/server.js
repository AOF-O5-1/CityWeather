import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Create __filename and __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import routes from './routes/index.js';
const app = express();
const PORT = process.env.PORT || 3005;
// Serve static files from the client dist folder using the constructed __dirname
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
