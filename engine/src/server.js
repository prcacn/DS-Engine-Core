require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const generateRoute   = require('./api/routes/generate');
const validateRoute   = require('./api/routes/validate');
const registryRoute   = require('./api/routes/registry');
const paintRoute      = require('./api/routes/paint');
const knowledgeRoute  = require('./api/routes/knowledge');
const errorHandler    = require('./api/middleware/errorHandler');
const auth            = require('./api/middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware global ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Webapp estática desde /public ─────────────────────────────────────────
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// ── Health check (sin auth) ────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    version:   '1.0.0',
    engine:    'DS IA-Ready Engine Core',
    ds_repo:   process.env.DS_REPO_PATH || 'not configured',
    pinecone:  process.env.PINECONE_API_KEY ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// ── Rutas protegidas con API Key ───────────────────────────────────────────
app.use('/generate',   auth, generateRoute);
app.use('/validate',   auth, validateRoute);
app.use('/registry',   auth, registryRoute);
app.use('/paint',      auth, paintRoute);
app.use('/knowledge',  auth, knowledgeRoute);

// ── Error handler global ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Arrancar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║   DS IA-Ready — Engine Core v1.0 · Fase 4        ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  ▸ Server     http://localhost:${PORT}`);
  console.log(`  ▸ Webapp     http://localhost:${PORT}/`);
  console.log(`  ▸ Health     http://localhost:${PORT}/health`);
  console.log(`  ▸ Knowledge  /knowledge/ingest · /knowledge/list · /knowledge/delete/:id`);
  console.log(`  ▸ DS Repo    ${process.env.DS_REPO_PATH || '⚠️  DS_REPO_PATH not set'}`);
  console.log('');
});
