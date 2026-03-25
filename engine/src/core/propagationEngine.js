// propagationEngine.js
// F-03 - Propagation Engine
// Cuando un cambio breaking es aprobado, propaga el efecto al repo de GitHub
// Ruta: engine/src/core/propagationEngine.js

const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO || 'prcacn/DS-Engine-Core';
const GITHUB_API   = 'api.github.com';

// ─── Utilidades GitHub API ───────────────────────────────────────────────
function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: GITHUB_API,
      path: `/repos/${GITHUB_REPO}/contents/${path}`,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent':    'DS-Engine-Bot',
        'Content-Type':  'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { resolve(raw); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function ghGet(path) {
  return ghRequest('GET', path);
}

async function ghPut(path, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
  };
  if (sha) body.sha = sha;
  return ghRequest('PUT', path, body);
}

// ─── Cargar contrato desde GitHub ────────────────────────────────────────
async function loadContractFromGH(slug) {
  const path = `Simple/contracts/${slug}.json`;
  try {
    const data = await ghGet(path);
    if (data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      return { contract: JSON.parse(content), sha: data.sha, path };
    }
  } catch {}
  return { contract: null, sha: null, path };
}

// ─── Guardar pending en GitHub ────────────────────────────────────────────
async function savePendingToGH(review) {
  const slug = review.component.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-=]/g, '');
  const path = `Simple/contracts/_pending/${slug}.review.json`;
  const content = JSON.stringify(review, null, 2);

  // Ver si ya existe
  let sha = null;
  try {
    const existing = await ghGet(path);
    sha = existing.sha;
  } catch {}

  await ghPut(path, content, `chore: pending review - ${review.component} (${review.reason})`, sha);
  console.log(`[Propagation] Pending guardado en GitHub: ${path}`);
  return { path, slug };
}

// ─── Listar pendings desde GitHub ────────────────────────────────────────
async function listPendingsFromGH() {
  try {
    const data = await ghRequest('GET', '', null);
    // Listar el directorio _pending
    const options = {
      hostname: GITHUB_API,
      path: `/repos/${GITHUB_REPO}/contents/Simple/contracts/_pending`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'DS-Engine-Bot',
      },
    };
    const files = await new Promise((resolve, reject) => {
      const req = https.request(options, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve([]); } });
      });
      req.on('error', reject);
      req.end();
    });

    if (!Array.isArray(files)) return [];

    const reviews = [];
    for (const file of files.filter(f => f.name.endsWith('.review.json'))) {
      try {
        const fileData = await ghGet(`Simple/contracts/_pending/${file.name}`);
        const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf-8'));
        reviews.push({ file: file.name, sha: fileData.sha, ...content });
      } catch {}
    }
    return reviews;
  } catch (err) {
    console.error('[Propagation] Error listando pendings:', err.message);
    return [];
  }
}

// ─── Eliminar pending de GitHub ───────────────────────────────────────────
async function deletePendingFromGH(fileName, sha) {
  const options = {
    hostname: GITHUB_API,
    path: `/repos/${GITHUB_REPO}/contents/Simple/contracts/_pending/${fileName}`,
    method: 'DELETE',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'DS-Engine-Bot',
      'Content-Type': 'application/json',
    },
  };
  const body = JSON.stringify({ message: `chore: resolve review - ${fileName}`, sha });
  await new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve(raw));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
  console.log(`[Propagation] Pending eliminado de GitHub: ${fileName}`);
}

// ─── Propagar aprobacion ──────────────────────────────────────────────────
async function propagateApproval(review) {
  if (!GITHUB_TOKEN) {
    console.warn('[Propagation] GITHUB_TOKEN no configurado - saltando propagacion');
    return { status: 'skipped', reason: 'no_github_token' };
  }

  const slug = review.component.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-=]/g, '');
  console.log(`[Propagation] Propagando aprobacion: ${review.component} (${review.reason})`);

  // 1. Cargar contrato actual
  const { contract, sha, path } = await loadContractFromGH(slug);

  if (review.reason === 'COMPONENT_DELETED') {
    // Componente eliminado aprobado -> marcar como DEPRECATED en el contrato
    if (contract) {
      contract.status      = 'DEPRECATED';
      contract.deprecatedAt = new Date().toISOString();
      contract.deprecatedReason = 'Eliminado de la libreria Figma - aprobado por revisor';
      await ghPut(path, JSON.stringify(contract, null, 2),
        `feat(DS): deprecar ${review.component} - componente eliminado de Figma`, sha);
      console.log(`[Propagation] Contrato marcado DEPRECATED: ${slug}`);
    }

  } else if (review.reason === 'COMPONENT_MODIFIED') {
    // Modificacion aprobada -> actualizar syncStatus y timestamp
    if (contract) {
      contract.syncStatus   = 'SYNCED';
      contract.lastModified = new Date().toISOString();
      contract.componentKey = review.componentKey || contract.componentKey;
      await ghPut(path, JSON.stringify(contract, null, 2),
        `feat(DS): sincronizar ${review.component} - cambio aprobado por revisor`, sha);
      console.log(`[Propagation] Contrato sincronizado: ${slug}`);
    }

  } else if (review.reason === 'COMPONENT_RENAMED') {
    // Renombrado aprobado -> actualizar nombre en contrato
    if (contract) {
      contract.name         = review.newName || contract.name;
      contract.lastModified = new Date().toISOString();
      await ghPut(path, JSON.stringify(contract, null, 2),
        `feat(DS): renombrar ${review.component} - aprobado por revisor`, sha);
      console.log(`[Propagation] Contrato renombrado: ${slug}`);
    }
  }

  // 2. Generar metadata AI actualizada
  await propagateAIMetadata(slug, contract, review);

  return { status: 'propagated', component: review.component, reason: review.reason };
}

// ─── Generar y subir metadata AI ─────────────────────────────────────────
async function propagateAIMetadata(slug, contract, review) {
  if (!contract) return;

  const metadata = {
    id:           slug,
    name:         contract.name || slug,
    status:       contract.status || 'ACTIVE',
    componentKey: contract.componentKey,
    lastSync:     new Date().toISOString(),
    syncSource:   'figma-inverse-flow',
    usageRules:   contract.rules || [],
    variants:     Object.keys(contract.variants || {}),
    tokens:       Object.keys(contract.tokens || {}),
    aiNotes:      contract.status === 'DEPRECATED'
      ? 'Este componente ha sido eliminado de la libreria. No usar en nuevas pantallas.'
      : `Componente sincronizado automaticamente desde Figma. Ultima revision: ${new Date().toLocaleDateString('es-ES')}.`,
  };

  const metaPath = `Simple/contracts/metadata/${slug}.ai.json`;
  let existingSha = null;
  try {
    const existing = await ghGet(metaPath);
    existingSha = existing.sha;
  } catch {}

  await ghPut(metaPath, JSON.stringify(metadata, null, 2),
    `chore(AI): actualizar metadata ${slug} - flujo inverso F-03`, existingSha);
  console.log(`[Propagation] AI metadata actualizada: ${slug}.ai.json`);
}

module.exports = {
  savePendingToGH,
  listPendingsFromGH,
  deletePendingFromGH,
  propagateApproval,
};
