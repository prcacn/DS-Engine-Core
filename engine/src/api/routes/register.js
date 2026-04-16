// engine/src/api/routes/register.js
// POST /register - Registra un componente nuevo en el DS
// Recibe el payload del plugin de Figma y genera + sube los 3 archivos a GitHub

const express  = require('express');
const router   = express.Router();
const https    = require('https');
const { generateAll } = require('../../core/contractGenerator');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO  = process.env.GITHUB_REPO || 'prcacn/DS-Engine-Core';
const GITHUB_BASE  = `https://api.github.com/repos/${GITHUB_REPO}/contents`;

// ─── GITHUB API HELPERS ───────────────────────────────────────────────────────
function ghRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type':  'application/json',
        'User-Agent':    'DS-IA-Ready-Engine',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch(e) { resolve({ error: 'parse_error', raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function ghGetSha(filePath) {
  try {
    const d = await ghRequest('GET', `/repos/${GITHUB_REPO}/contents/${filePath}`, null);
    return d.sha || null;
  } catch { return null; }
}

async function ghUpload(filePath, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  };
  const d = await ghRequest('PUT', `/repos/${GITHUB_REPO}/contents/${filePath}`, body);
  return 'content' in d;
}

// ─── PARCHEAR UN ARCHIVO JS EXISTENTE ────────────────────────────────────────
// Inserta una entrada nueva antes de un marcador de cierre
async function patchJsFile(filePath, marker, newEntry, message) {
  const d = await ghRequest('GET', `/repos/${GITHUB_REPO}/contents/${filePath}`, null);
  if (!d.content) return { ok: false, error: 'file_not_found' };

  const current = Buffer.from(d.content, 'base64').toString('utf8');
  const sha = d.sha;

  // Verificar que la entrada no existe ya
  if (current.includes(`'${newEntry.key}':`)) {
    return { ok: false, error: 'already_exists' };
  }

  // Insertar antes del marcador
  if (!current.includes(marker)) {
    return { ok: false, error: `marker_not_found: ${marker}` };
  }

  const patched = current.replace(marker, `${newEntry.code}\n${marker}`);
  const ok = await ghUpload(filePath, patched, message, sha);
  return { ok };
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const payload = req.body;

    // Validación básica
    if (!payload.name || !payload.nodeId) {
      return res.status(400).json({ error: 'BadRequest', message: 'name y nodeId son requeridos' });
    }

    // Validación: rechazar nombres que son componentes internos del DS
    const INTERNAL_NAMES = ['title', 'subtitle', 'label', 'icon', 'divider', 'undefined'];
    if (INTERNAL_NAMES.includes(payload.name.toLowerCase())) {
      return res.status(400).json({
        error: 'InvalidComponent',
        message: `'${payload.name}' parece ser un nodo interno del DS, no un componente público. Selecciona el COMPONENT_SET padre correcto.`
      });
    }

    console.log(`  → [/register] Registrando: ${payload.name} (${payload.nodeId})`);

    // 1. Generar contrato, patches y descripción IA
    const generated = await generateAll(payload);
    const { contractMd, spacingPatch, pluginPatch, painterPatch, rendererPatch, aiData } = generated;

    // Solo generar - no subir. El plugin pide preview primero.
    if (req.body.preview_only) {
      return res.json({
        ok:           true,
        preview:      true,
        contractMd,
        spacingPatch,
        pluginPatch,
        painterPatch,
        rendererPatch,
        aiData,
        meta:         generated.meta,
      });
    }

    // 2. Subir contrato
    const contractPath = `engine/contracts/${payload.name.replace(/\//g, '-')}.md`;
    const contractSha  = await ghGetSha(contractPath);
    const contractOk   = await ghUpload(
      contractPath,
      contractMd,
      `feat: contrato ${payload.name} - registrado desde plugin`,
      contractSha
    );

    // 3. Parchear spacingRegistry.js
    const spacingResult = await patchJsFile(
      'engine/src/core/spacingRegistry.js',
      '\n};',
      { key: payload.name, code: spacingPatch.entryCode },
      `feat: spacingRegistry - anadir ${payload.name}`
    );

    // 4. Parchear figma-plugin/code.js - COMPONENT_NODE_IDS
    const pluginNodeResult = await patchJsFile(
      'figma-plugin/code.js',
      "  'chart-sparkline':                '137:1746', // COMPONENT (sin set)",
      { key: payload.name, code: `  '${payload.name}': '${payload.nodeId}', // COMPONENT_SET` },
      `feat: plugin - anadir ${payload.name} a COMPONENT_NODE_IDS`
    );

    // 5. Parchear HEIGHT_MAP
    const pluginHeightResult = await patchJsFile(
      'figma-plugin/code.js',
      "  'chart-sparkline':                80,",
      { key: payload.name + '_h', code: `  '${payload.name}': ${payload.height || 72},` },
      `feat: plugin - anadir ${payload.name} a HEIGHT_MAP`
    );

    // 6. Parchear figmaPainter.js — PAINTER_META
    const painterResult = await patchJsFile(
      'engine/src/core/figmaPainter.js',
      painterPatch.marker,
      { key: payload.name, code: painterPatch.entryCode },
      `feat: figmaPainter - anadir ${payload.name} a PAINTER_META`
    );

    // 7. Parchear screenRenderer.js — CSS + función render + switch case
    // 7a. CSS
    const rendererCssResult = await patchJsFile(
      'engine/src/core/screenRenderer.js',
      rendererPatch.cssMarker,
      { key: payload.name + '_css', code: rendererPatch.cssEntry },
      `feat: screenRenderer CSS - anadir ${payload.name}`
    );

    // 7b. Función render — insertar antes del bloque renderScreen
    const rendererFnResult = await patchJsFile(
      'engine/src/core/screenRenderer.js',
      rendererPatch.fnMarker,
      { key: 'function ' + rendererPatch.fnName, code: rendererPatch.renderFn },
      `feat: screenRenderer fn - anadir ${rendererPatch.fnName}`
    );

    // 7c. Caso en el switch dispatcher
    const rendererSwitchResult = await patchJsFile(
      'engine/src/core/screenRenderer.js',
      rendererPatch.switchMarker,
      { key: "case '" + payload.name + "'", code: rendererPatch.switchCase },
      `feat: screenRenderer switch - anadir ${payload.name}`
    );

    const results = {
      contract:        { ok: contractOk,                  path: contractPath },
      spacingRegistry: { ok: spacingResult.ok,            error: spacingResult.error },
      pluginNodeIds:   { ok: pluginNodeResult.ok,         error: pluginNodeResult.error },
      pluginHeight:    { ok: pluginHeightResult.ok,       error: pluginHeightResult.error },
      figmaPainter:    { ok: painterResult.ok,            error: painterResult.error },
      rendererCss:     { ok: rendererCssResult.ok,        error: rendererCssResult.error },
      rendererFn:      { ok: rendererFnResult.ok,         error: rendererFnResult.error },
      rendererSwitch:  { ok: rendererSwitchResult.ok,     error: rendererSwitchResult.error },
    };

    const allOk = Object.values(results).every(r => r.ok);
    console.log(`  ${allOk ? '✓' : '⚠'} [/register] ${payload.name}: ${JSON.stringify(results)}`);

    res.json({
      ok:       allOk,
      name:     payload.name,
      nodeId:   payload.nodeId,
      results,
      aiData,
      contractPath,
      meta:     generated.meta,
      propagated_to: ['contracts/', 'spacingRegistry.js', 'figma-plugin/code.js', 'figmaPainter.js', 'screenRenderer.js'],
      deploy_command: `cd '/Users/pablo.reguera/DS Engine Core/engine' && git pull --rebase && railway up`,
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
