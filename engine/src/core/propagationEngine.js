// propagationEngine.js
// F-02 + F-03 - Persistencia en GitHub y propagacion de cambios aprobados
// Ruta: engine/src/core/propagationEngine.js
//
// Responsabilidades:
//   savePendingToGH()    - guarda un review.json en Simple/contracts/_pending/ en GitHub
//   listPendingsFromGH() - lista todos los pending desde GitHub
//   deletePendingFromGH()- elimina un pending de GitHub (tras aprobar o rechazar)
//   propagateApproval()  - cuando se aprueba, actualiza el contrato y regenera metadata IA

const https = require('https');

const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO  = process.env.GITHUB_REPO || 'prcacn/DS-Engine-Core';
const PENDING_BASE = 'Simple/contracts/_pending';
const CONTRACTS_BASE = 'Simple/contracts';

// ─── Helpers GitHub API ───────────────────────────────────────────────────

function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    if (!GH_TOKEN) return reject(new Error('GITHUB_TOKEN no configurado'));
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GH_REPO}/contents/${path}`,
      method,
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'User-Agent': 'DS-Engine-Bot',
        'Content-Type': 'application/json',
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

function toBase64(str) {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function fromBase64(str) {
  return Buffer.from(str.replace(/\n/g, ''), 'base64').toString('utf-8');
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-=]/g, '');
}

// ─── F-02: Guardar pending en GitHub ─────────────────────────────────────

async function savePendingToGH(reviewData) {
  const slug = slugify(reviewData.component);
  const filename = `${slug}.review.json`;
  const path = `${PENDING_BASE}/${filename}`;
  const content = JSON.stringify({ ...reviewData, file: filename }, null, 2);

  // Si ya existe, obtener su SHA para sobreescribir
  let sha;
  try {
    const existing = await ghRequest('GET', path);
    sha = existing.sha;
  } catch { /* no existe, primera vez */ }

  await ghRequest('PUT', path, {
    message: `review: pending ${reviewData.reason} - ${reviewData.component}`,
    content: toBase64(content),
    ...(sha ? { sha } : {}),
  });

  console.log(`[Propagation] Pending guardado en GitHub: ${filename}`);
  return filename;
}

// ─── F-02: Listar pendings desde GitHub ──────────────────────────────────

async function listPendingsFromGH() {
  try {
    const files = await ghRequest('GET', PENDING_BASE);
    if (!Array.isArray(files)) return [];

    const reviews = [];
    for (const f of files.filter(f => f.name.endsWith('.review.json'))) {
      try {
        const fileData = await ghRequest('GET', f.path);
        const content = JSON.parse(fromBase64(fileData.content));
        reviews.push({ ...content, file: f.name, sha: fileData.sha });
      } catch (e) {
        console.warn(`[Propagation] No se pudo leer ${f.name}:`, e.message);
      }
    }
    return reviews;
  } catch (err) {
    console.warn('[Propagation] No hay directorio _pending o esta vacio:', err.message);
    return [];
  }
}

// ─── F-02: Eliminar pending de GitHub ────────────────────────────────────

async function deletePendingFromGH(filename, sha) {
  const path = `${PENDING_BASE}/${filename}`;

  // Si no nos pasan SHA, lo obtenemos
  if (!sha) {
    try {
      const f = await ghRequest('GET', path);
      sha = f.sha;
    } catch {
      console.warn(`[Propagation] No se encontro ${filename} para eliminar`);
      return;
    }
  }

  await ghRequest('DELETE', path, {
    message: `review: eliminar pending ${filename}`,
    sha,
  });

  console.log(`[Propagation] Pending eliminado de GitHub: ${filename}`);
}

// ─── F-03: Propagar aprobacion al contrato ────────────────────────────────
// Cuando el designer aprueba un cambio breaking:
// 1. Actualiza el contrato JSON del componente en GitHub
// 2. Regenera el metadata de IA (.ai.json)
// 3. Loggea el evento de gobernanza

async function propagateApproval(review) {
  const slug = slugify(review.component);
  const contractPath = `${CONTRACTS_BASE}/${slug}.json`;

  console.log(`[Propagation] Propagando aprobacion: ${review.component} (${review.reason})`);

  // 1. Leer contrato actual si existe
  let contract = null;
  let contractSha = null;
  try {
    const existing = await ghRequest('GET', contractPath);
    contract = JSON.parse(fromBase64(existing.content));
    contractSha = existing.sha;
  } catch {
    // No existe contrato previo - crear uno base
    contract = {
      id: slug,
      name: review.component,
      componentKey: review.componentKey,
      source: 'figma-watcher',
      status: 'ACTIVE',
      variants: {},
      tokens: {},
      rules: [],
    };
  }

  // 2. Aplicar el cambio segun el tipo
  if (review.reason === 'COMPONENT_DELETED') {
    contract.status = 'DEPRECATED';
    contract.deprecatedAt = new Date().toISOString();
    contract.deprecatedReason = 'Componente eliminado de la libreria Figma';
  } else if (review.reason === 'COMPONENT_MODIFIED') {
    contract.componentKey = review.componentKey;
    contract.lastModified = new Date().toISOString();
    contract.syncStatus = 'SYNCED';
  } else if (review.reason === 'COMPONENT_RENAMED') {
    contract.previousName = contract.name;
    contract.name = review.component;
    contract.lastModified = new Date().toISOString();
  }

  contract.lastReviewedAt = new Date().toISOString();
  contract.lastReviewedBy = 'design-system-engine';

  // 3. Guardar contrato actualizado en GitHub
  await ghRequest('PUT', contractPath, {
    message: `contract: actualizar ${slug} tras aprobacion de cambio breaking`,
    content: toBase64(JSON.stringify(contract, null, 2)),
    ...(contractSha ? { sha: contractSha } : {}),
  });

  console.log(`[Propagation] Contrato actualizado: ${contractPath}`);

  // 4. Regenerar metadata de IA para el componente
  const aiMetadata = generateAIMetadata(contract);
  const aiPath = `${CONTRACTS_BASE}/${slug}.ai.json`;

  let aiSha;
  try {
    const existing = await ghRequest('GET', aiPath);
    aiSha = existing.sha;
  } catch { /* no existe */ }

  await ghRequest('PUT', aiPath, {
    message: `metadata: regenerar AI metadata de ${slug}`,
    content: toBase64(JSON.stringify(aiMetadata, null, 2)),
    ...(aiSha ? { sha: aiSha } : {}),
  });

  console.log(`[Propagation] AI metadata regenerado: ${aiPath}`);

  // 5. Log de gobernanza
  await appendGovernanceLog({
    action: 'APPROVED',
    component: review.component,
    reason: review.reason,
    timestamp: new Date().toISOString(),
    propagated: true,
  });

  return {
    contractUpdated: contractPath,
    aiMetadataUpdated: aiPath,
    status: contract.status,
  };
}

// ─── Generar metadata de IA para el componente ───────────────────────────

function generateAIMetadata(contract) {
  return {
    $schema: 'ai-metadata/v1',
    id: contract.id,
    name: contract.name,
    status: contract.status || 'ACTIVE',
    componentKey: contract.componentKey || null,
    usage: {
      when: `Usar ${contract.name} cuando se necesite este componente en la interfaz`,
      avoid: contract.status === 'DEPRECATED'
        ? `DEPRECATED: No usar ${contract.name} - ha sido eliminado de la libreria`
        : null,
    },
    variants: contract.variants || {},
    tokens: contract.tokens || {},
    rules: contract.rules || [],
    lastUpdated: new Date().toISOString(),
    generatedBy: 'ds-engine-propagation',
  };
}

// ─── Log de gobernanza ────────────────────────────────────────────────────

async function appendGovernanceLog(entry) {
  const logPath = 'Simple/contracts/_governance-log.jsonl';
  let existingContent = '';
  let sha;

  try {
    const existing = await ghRequest('GET', logPath);
    existingContent = fromBase64(existing.content);
    sha = existing.sha;
  } catch { /* primera entrada */ }

  const newContent = existingContent + JSON.stringify(entry) + '\n';

  await ghRequest('PUT', logPath, {
    message: `log: ${entry.action} - ${entry.component}`,
    content: toBase64(newContent),
    ...(sha ? { sha } : {}),
  });
}

module.exports = {
  savePendingToGH,
  listPendingsFromGH,
  deletePendingFromGH,
  propagateApproval,
};
