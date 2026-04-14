// api/routes/generate-doc.js
// POST /generate-doc
// Genera documentación completa de pantalla y la sube a engine/examples/ en GitHub

const express           = require('express');
const router            = express.Router();
const Anthropic         = require('@anthropic-ai/sdk');
const { loadContracts } = require('../../loaders/contractLoader');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Sube un archivo markdown a GitHub ────────────────────────────────────────
async function saveToGitHub(filename, content) {
  const token = process.env.GITHUB_TOKEN;
  const repo  = process.env.GITHUB_REPO || 'prcacn/DS-Engine-Core';
  if (!token) {
    console.warn('  ⚠ [generate-doc] GITHUB_TOKEN no configurado — doc no guardada en repo');
    return null;
  }

  const path    = 'engine/examples/' + filename;
  const apiUrl  = 'https://api.github.com/repos/' + repo + '/contents/' + path;
  const encoded = Buffer.from(content, 'utf-8').toString('base64');

  // Comprobar si el archivo ya existe para obtener su SHA
  let existingSha = null;
  try {
    const checkRes = await fetch(apiUrl, {
      headers: { Authorization: 'token ' + token, 'User-Agent': 'DS-Engine' }
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      existingSha = existing.sha;
    }
  } catch (_) {}

  const body = {
    message: 'docs: add screen documentation — ' + filename,
    content: encoded,
  };
  if (existingSha) body.sha = existingSha;

  const res = await fetch(apiUrl, {
    method:  'PUT',
    headers: {
      Authorization:  'token ' + token,
      'Content-Type': 'application/json',
      'User-Agent':   'DS-Engine',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('  ✗ [generate-doc] GitHub upload error:', res.status, err.slice(0, 200));
    return null;
  }

  const data = await res.json();
  console.log('  ✓ [generate-doc] Guardado en GitHub:', path, '| commit:', data.commit?.sha?.slice(0, 8));
  return path;
}

router.post('/', async function(req, res, next) {
  try {
    const { brief, components, score, kb_rules, frame_id, pattern } = req.body;

    if (!brief || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'BadRequest', message: 'brief y components son requeridos' });
    }

    const contracts = loadContracts();

    // ── Contexto de contratos ──────────────────────────────────────────────
    const contractContext = components.map((c, i) => {
      const name     = typeof c === 'string' ? c : c.component;
      const contract = contracts[name];
      const nodeId   = (typeof c === 'object' && c.node_id) ? c.node_id : 'pending';
      if (!contract) return '| ' + i + ' | ' + name + ' | `' + nodeId + '` | - | - |';
      return '| ' + i + ' | ' + name + ' | `' + nodeId + '` | ' + (contract.description ? contract.description.slice(0, 60) : '-') + ' | - |';
    }).join('\n');

    // ── Contexto KB ────────────────────────────────────────────────────────
    const kbContext = (kb_rules || []).length > 0
      ? (kb_rules || []).map(r => '- [' + (r.categoria || r.tipo || 'regla') + '] ' + (r.content || r.text || '').slice(0, 120)).join('\n')
      : 'No se aplicaron reglas KB específicas.';

    const componentNames = components.map(c => typeof c === 'string' ? c : c.component).join(', ');
    const scoreStatus    = score >= 80 ? 'APROBADO' : score >= 60 ? 'REVISAR' : 'BLOQUEADO';
    const slugBrief      = brief.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

    const prompt = `Eres un experto en Design Systems. Genera documentación técnica completa de esta pantalla siguiendo EXACTAMENTE el formato del template oficial.

## DATOS DE LA PANTALLA
- Brief: ${brief}
- Patrón: ${pattern || 'desconocido'}
- Score DS: ${score}% (${scoreStatus})
- Frame ID: ${frame_id || 'sin id'}
- Componentes detectados: ${componentNames}

## CONTRATOS DS APLICADOS
| Orden | Componente | Node ID | Descripción |
|-------|------------|---------|-------------|
${contractContext}

## REGLAS KB APLICADAS
${kbContext}

---

Genera el documento Markdown completo siguiendo EXACTAMENTE esta estructura:

\`\`\`
# Template: [Nombre descriptivo de la pantalla]

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** ${slugBrief}
- **Tipo:** [tipo de pantalla según el patrón]
- **Categoría:** [dominio: investments / payments / onboarding / etc]
- **Nodo Figma:** \`${frame_id || 'pending'}\`
- **Score DS:** ${score}% - ${scoreStatus}
- **Patrón:** ${pattern || 'desconocido'}

## DESCRIPCIÓN
[2-3 frases describiendo qué hace esta pantalla, para quién y en qué contexto]

## ESTRUCTURA VISUAL
[Diagrama ASCII con los componentes en orden]
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header]                                    │
├─────────────────────────────────────────────────────────┤
│  [Componentes en orden...]                              │
└─────────────────────────────────────────────────────────┘

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
[Una fila por componente]

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | [inferir] |
| Padding | [inferir] |
| Fondo | [token de color] |
| Ancho | 390px |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
[Tokens relevantes]

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
[Acciones del usuario y destinos]

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
[Reglas KB aplicadas e inferidas]

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
[Tabla resumen]
\`\`\`

IMPORTANTE: Responde SOLO con el documento Markdown. Sin explicaciones ni comentarios.`;

    const response = await anthropic.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 2500,
      messages:   [{ role: 'user', content: prompt }],
    });

    const doc = response.content[0]?.text || '// Error generando documentación';
    const cleanDoc = doc.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '').trim();

    // ── Subir a GitHub ────────────────────────────────────────────────────
    const filename  = 'doc-' + slugBrief + '-' + Date.now().toString().slice(-4) + '.md';
    const githubPath = await saveToGitHub(filename, cleanDoc);

    console.log(`  ✓ [generate-doc] "${brief.slice(0,40)}" · ${components.length} comps · score ${score}% · ${cleanDoc.length} chars`);

    res.json({
      ok:          true,
      doc:         cleanDoc,
      brief,
      score,
      components:  components.length,
      pattern,
      github_path: githubPath,
      filename,
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
