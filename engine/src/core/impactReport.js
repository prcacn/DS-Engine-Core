// impactReport.js
// F-03 extendido - Detecta que ejemplos, patrones y contratos
// referencian un componente afectado por un cambio breaking
// Ruta: engine/src/core/impactReport.js

const https = require('https');

const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO  = process.env.GITHUB_REPO || 'prcacn/DS-Engine-Core';

const SCAN_DIRS = [
  { path: 'engine/examples',    type: 'example'     },
  { path: 'engine/patterns',    type: 'pattern'     },
  { path: 'engine/contracts',   type: 'contract'    },
  { path: 'engine/global-rules', type: 'global-rule' },
];

function ghGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GH_REPO}/contents/${path}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GH_TOKEN}`,
        'User-Agent': 'DS-Engine-Bot',
      },
    };
    const req = https.request(options, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => { try { resolve(JSON.parse(raw)); } catch { resolve(raw); } });
    });
    req.on('error', reject);
    req.end();
  });
}

function fromBase64(str) {
  return Buffer.from(str.replace(/\n/g, ''), 'base64').toString('utf-8');
}

function findReferences(content, componentName) {
  const refs = [];
  const lines = content.split('\n');
  const variants = [
    componentName,
    componentName.toLowerCase(),
    componentName.replace(/\s+/g, '-').toLowerCase(),
    componentName.replace(/\s+/g, '_').toLowerCase(),
  ];
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    for (const v of variants) {
      if (lower.includes(v.toLowerCase())) {
        refs.push({ line: i + 1, text: line.trim() });
        break;
      }
    }
  });
  return refs;
}

async function scanForComponent(componentName) {
  const affected = [];
  for (const dir of SCAN_DIRS) {
    let files;
    try {
      files = await ghGet(dir.path);
      if (!Array.isArray(files)) continue;
    } catch { continue; }

    for (const f of files.filter(f => f.type === 'file')) {
      try {
        const fileData = await ghGet(f.path);
        const content = fromBase64(fileData.content);
        const refs = findReferences(content, componentName);
        if (refs.length > 0) {
          affected.push({ type: dir.type, file: f.name, path: f.path, refs, refCount: refs.length });
        }
      } catch (e) {
        console.warn(`[ImpactReport] No se pudo leer ${f.path}:`, e.message);
      }
    }
  }
  return affected;
}

function buildRecommendation(reason, affected) {
  if (affected.length === 0) return 'Sin impacto en documentos del sistema. Puedes aprobar sin riesgo.';
  const docList = affected.map(a => a.file).join(', ');
  if (reason === 'COMPONENT_DELETED') {
    return `ATENCION: Este componente aparece en ${affected.length} documentos (${docList}). Al aprobar la deprecacion, estos documentos quedaran desactualizados. Revisa y actualiza manualmente antes de aprobar.`;
  }
  if (reason === 'COMPONENT_RENAMED') {
    return `Este componente aparece en ${affected.length} documentos (${docList}). Al aprobar el renombrado, actualiza las referencias en estos archivos.`;
  }
  return `Este componente aparece en ${affected.length} documentos (${docList}). Verifica que los cambios son compatibles con los usos existentes.`;
}

async function generateImpactReport(review) {
  const { component, reason, componentKey } = review;
  console.log(`[ImpactReport] Escaneando impacto de: ${component} (${reason})`);
  const affected = await scanForComponent(component);
  const report = {
    component, reason, componentKey,
    timestamp: new Date().toISOString(),
    summary: {
      total:       affected.length,
      examples:    affected.filter(a => a.type === 'example').length,
      patterns:    affected.filter(a => a.type === 'pattern').length,
      contracts:   affected.filter(a => a.type === 'contract').length,
      globalRules: affected.filter(a => a.type === 'global-rule').length,
    },
    affected,
    recommendation: buildRecommendation(reason, affected),
  };
  console.log(`[ImpactReport] ${affected.length} documentos afectados:`);
  affected.forEach(a => console.log(`  - [${a.type}] ${a.file} (${a.refCount} referencias)`));
  return report;
}

module.exports = { generateImpactReport, scanForComponent };
