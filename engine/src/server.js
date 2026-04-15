require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const generateRoute   = require('./api/routes/generate');
const validateRoute   = require('./api/routes/validate');
const registryRoute   = require('./api/routes/registry');
const paintRoute      = require('./api/routes/paint');
const knowledgeRoute  = require('./api/routes/knowledge');
const generateDocRoute = require('./api/routes/generate-doc');
const approveRoute     = require('./api/routes/approve');
const registerRoute    = require('./api/routes/register');
const renderRoute      = require('./api/routes/render');
const webhookRoute     = require('./api/routes/webhook');  // F-01 flujo inverso
const reviewRoute      = require('./api/routes/review');   // F-02 panel de revision
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
    version:   '2.0.0',
    engine:    'DS IA-Ready Engine Core',
    ds_repo:   process.env.DS_REPO_PATH || 'not configured',
    pinecone:  process.env.PINECONE_API_KEY ? 'configured' : 'not configured',
    webhook:   process.env.FIGMA_WEBHOOK_PASSCODE ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// ── Webhook de Figma (sin auth — Figma no envía API key) ──────────────────
// Seguridad: verificación por passcode en el handler
app.use('/webhook', webhookRoute);
app.use('/review',  auth, reviewRoute);

// ── Rutas protegidas con API Key ───────────────────────────────────────────
app.use('/generate',   auth, generateRoute);
app.use('/validate',   auth, validateRoute);
app.use('/registry',   auth, registryRoute);
app.use('/paint',      auth, paintRoute);
app.use('/knowledge',  auth, knowledgeRoute);
app.use('/generate-doc', auth, generateDocRoute);
app.use('/approve',      auth, approveRoute);
app.use('/register',     auth, registerRoute);
app.use('/render',       auth, renderRoute);


// ── Debug: verificar versión de archivos en disco ─────────────────────────
app.get('/debug/intent-version', (req, res) => {
  const fs   = require('fs');
  const path = require('path');
  const file = path.join(__dirname, 'core/intentParser.js');
  try {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    res.json({
      first_line: lines[0],
      second_line: lines[1],
      total_lines: lines.length,
      path: file,
    });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// ── Error handler global ───────────────────────────────────────────────────
app.use(errorHandler);

// ── Arrancar servidor ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════════════╗');
  console.log('  ║   DS IA-Ready — Engine Core v2.0 · Level 5.0     ║');
  console.log('  ╚═══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  ▸ Server     http://localhost:${PORT}`);
  console.log(`  ▸ Webapp     http://localhost:${PORT}/`);
  console.log(`  ▸ Health     http://localhost:${PORT}/health`);
  console.log(`  ▸ Knowledge  /knowledge/ingest · /knowledge/list · /knowledge/delete/:id`);
  console.log(`  ▸ Render     /render  → HTML con CSS variables del DS listo para producción`);
  console.log(`  ▸ Webhook    /webhook/figma  → Flujo inverso F-01`);
  console.log(`  ▸ DS Repo    ${process.env.DS_REPO_PATH || '⚠️  DS_REPO_PATH not set'}`);
  console.log('');
});
