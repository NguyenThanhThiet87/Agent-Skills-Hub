import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import { connectDB, getDBStatus } from './config/db.js';
import skillRoutes from './routes/skillRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static frontend assets
app.use(express.static(publicDir));

// API routes
app.use('/api/skills', skillRoutes);

// Fallback to index.html for single-page app
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
async function start() {
  console.log('🚀 Starting SYNEXAN Agent Skill Hub...');
  await connectDB();

  const server = app.listen(config.port, () => {
    const status = getDBStatus();
    console.log(`\n=================================================`);
    console.log(`🌐 Server Web UI running at: http://localhost:${config.port}`);
    console.log(`📡 REST API endpoint:       http://localhost:${config.port}/api/skills`);
    console.log(`💾 Storage Mode:            ${status.mode}`);
    if (status.connected) {
      console.log(`🗄️  MongoDB Database:        ${status.databaseName}`);
    } else {
      console.log(`📂 Fallback File Path:      ${status.skillsDir}`);
    }
    console.log(`🔌 MCP Stdio Server:        node server/mcp/mcpBridge.js`);
    console.log(`=================================================\n`);
  });

  return server;
}

start();

export default app;
