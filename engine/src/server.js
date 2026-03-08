require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const generateRoute = require('./api/routes/generate');
const validateRoute = require('./api/routes/validate');
const registryRoute = require('./api/routes/registry');
const errorHandler = require('./api/middleware/errorHandler');
const auth = require('./api/middleware/auth');
const figmaRoutes = require('./api/routes/figma');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', engine: 'DS IA-Ready Engine Core', ds_repo: process.env.DS_REPO_PATH || 'not configured', timestamp: new Date().toISOString() });
});

app.get('/config', (req, res) => {
  res.json({ anthropic_api_key: process.env.ANTHROPIC_API_KEY || '', engine_api_key: process.env.ENGINE_API_KEY || '' });
});

app.use('/generate', auth, generateRoute);
app.use('/validate', auth, validateRoute);
app.use('/registry', auth, registryRoute);
app.use('/figma', figmaRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  ▸ Server running at  http://localhost:${PORT}`);
  console.log(`  ▸ Config endpoint    http://localhost:${PORT}/config`);
  console.log(`  ▸ DS Repo            ${process.env.DS_REPO_PATH || '⚠️  DS_REPO_PATH not set'}\n`);
});
