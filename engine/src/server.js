require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const generateRoute = require('./api/routes/generate');
const validateRoute = require('./api/routes/validate');
const registryRoute = require('./api/routes/registry');
const paintRoute = require('./api/routes/paint');
const errorHandler = require('./api/middleware/errorHandler');
const auth = require('./api/middleware/auth');
const knowledgeRoute = require('./api/routes/knowledge');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Webapp estática desde /public ─────────────────────────────────────────
// Sirve index.html en la raíz: https://ds-ia-ready-engine-production.up.railway.app/
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ── Health check (sin auth — para verificar que el server está vivo) ───────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    engine: 'DS IA-Ready Engine Core',
    ds_repo: process.env.DS_REPO_PATH || 'not configured',
    timestamp: new Date().toISOString()
  });
});

// ── Rutas protegidas con API Key ───────────────────────────────────────────
app.use('/generate', auth, generateRoute);
app.use('/validate', auth, validateRoute);
app.use('/registry', auth, registryRoute);
app.use('/paint', auth, paintRoute);
app.use('/knowledge', auth, knowledgeRoute);

// ── Error handler global ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Arrancar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║     DS IA-Ready — Engine Core v1.0       ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log(`  ▸ Server running at  http://localhost:${PORT}`);
  console.log(`  ▸ Webapp             http://localhost:${PORT}/`);
  console.log(`  ▸ Health check       http://localhost:${PORT}/health`);
  console.log(`  ▸ DS Repo            ${process.env.DS_REPO_PATH || '⚠️  DS_REPO_PATH not set'}`);
  console.log('');
});
