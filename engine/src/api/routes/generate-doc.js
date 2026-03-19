// api/routes/generate-doc.js
// POST /generate-doc
// Genera documentación completa de pantalla siguiendo el template oficial del DS

const express           = require('express');
const router            = express.Router();
const Anthropic         = require('@anthropic-ai/sdk');
const { loadContracts } = require('../../loaders/contractLoader');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async function(req, res, next) {
  try {
    const { brief, components, score, kb_rules, frame_id, pattern } = req.body;

    if (!brief || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'BadRequest', message: 'brief y components son requeridos' });
    }

    const contracts = loadContracts();

    // ── Contexto de contratos ──────────────────────────────────────────────
    const contractContext = components.map((c, i) => {
      const contract = contracts[c.component];
      const nodeId   = c.node_id || 'pending';
      if (!contract) return `| ${i} | ${c.component} | \`${nodeId}\` | — | — |`;
      return `| ${i} | ${c.component} | \`${nodeId}\` | ${contract.description ? contract.description.slice(0, 60) : '—'} | — |`;
    }).join('\n');

    // ── Contexto KB ────────────────────────────────────────────────────────
    const kbContext = (kb_rules || []).length > 0
      ? (kb_rules || []).map(r => `- [${r.categoria || r.tipo || 'regla'}] ${(r.content || r.text || '').slice(0, 120)}`).join('\n')
      : 'No se aplicaron reglas KB específicas.';

    // ── Componentes para la tabla de navegación ────────────────────────────
    const componentNames = components.map(c => c.component).join(', ');
    const scoreStatus    = score >= 80 ? 'APROBADO' : score >= 60 ? 'REVISAR' : 'BLOQUEADO';
    const templateId     = (brief.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)) + '-' + Date.now().toString().slice(-4);

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

Genera el documento Markdown completo siguiendo EXACTAMENTE esta estructura. Rellena cada sección con los datos reales de la pantalla. No omitas ninguna sección. No añadas secciones extra.

\`\`\`
# Template: [Nombre descriptivo de la pantalla] — [variante si aplica]

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** [slug-del-brief]
- **Tipo:** [tipo de pantalla según el patrón]
- **Categoría:** [dominio detectado, ej: investments / payments / onboarding]
- **Nodo Figma:** \`${frame_id || 'pending'}\`
- **Score DS:** ${score}% — ${scoreStatus}
- **Patrón:** ${pattern || 'desconocido'}

## DESCRIPCIÓN
[2-3 frases describiendo qué hace esta pantalla, para quién y en qué contexto aparece]

## ESTRUCTURA VISUAL
[Dibuja un diagrama ASCII que represente la composición de la pantalla con los componentes en orden. Usa el estilo del ejemplo:
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header]                                    │
├─────────────────────────────────────────────────────────┤
│  [Componente 1]                                         │
│  [Componente 2 × N]                                     │
│  [...]                                                  │
│  [Componente último — CTA o tab-bar]                    │
└─────────────────────────────────────────────────────────┘
]

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante / Estado | Notas |
|-------|------------|---------|-------------------|-------|
[Una fila por cada componente detectado, en orden de aparición]

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | [inferir según tipo de pantalla] |
| Padding | [inferir] |
| Fondo | [token de color de fondo] |
| Ancho | 390px |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|---------------|
[Lista los tokens de diseño relevantes para esta pantalla. Usa los tokens del DS si los conoces, o deja el valor como [pending] si no tienes certeza]

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
[Lista las acciones posibles del usuario y a dónde llevan. Infiere a partir del brief y los componentes]

---

## ANOTACIONES

\`\`\`yaml
annotations:
[Una anotación por cada componente relevante. Formato:
  - nodeId: "[node_id]"
    label: "[nombre del componente]"
    note: >
      [Explicación de para qué sirve este componente en esta pantalla específica,
      qué datos muestra, qué reglas aplican sobre él]
]
\`\`\`

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
[Lista las reglas de negocio que afectan a esta pantalla. Incluye las reglas KB aplicadas y cualquier regla inferida del brief]

---

## COMPONENTES UTILIZADOS (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
[Tabla resumen de todos los componentes]
\`\`\`

IMPORTANTE: Responde SOLO con el documento Markdown. Sin explicaciones previas ni comentarios posteriores.`;

    const response = await anthropic.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 2500,
      messages:   [{ role: 'user', content: prompt }],
    });

    const doc = response.content[0]?.text || '// Error generando documentación';

    // Limpiar posibles backticks envolventes que Claude añada
    const cleanDoc = doc.replace(/^```(?:markdown)?\n?/, '').replace(/\n?```$/, '').trim();

    console.log(`  ✓ [generate-doc] "${brief.slice(0,40)}..." · ${components.length} componentes · score ${score}% · ${cleanDoc.length} chars`);

    res.json({ ok: true, doc: cleanDoc, brief, score, components: components.length, pattern });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
