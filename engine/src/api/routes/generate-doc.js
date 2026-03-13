// api/routes/generate-doc.js — Fase 4 (Studio)
// POST /generate-doc
// Genera documentación .md de una pantalla validada.
// Usa Claude + contexto KB para producir un doc con:
//   - Qué hace la pantalla
//   - Componentes y sus roles
//   - Reglas KB que aplican
//   - Flujo del usuario
//   - Decisiones de diseño relevantes

const express   = require('express');
const router    = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── CONSTRUIR EL PROMPT ──────────────────────────────────────────────────────

function buildDocPrompt(brief, components, score, kbRules) {
  const compList = (components || [])
    .map((c, i) => `  ${i + 1}. ${c.component}${c.variant && c.variant !== 'default' ? ` (${c.variant})` : ''}${c.kb_injected ? ' [KB]' : ''}`)
    .join('\n');

  const kbContext = (kbRules || [])
    .filter(r => r.content)
    .map(r => `  - [${r.tipo || 'regla'} · ${r.geografia || 'global'}] ${r.content}`)
    .join('\n');

  return `Eres un documentador de Design Systems. Tu trabajo es generar documentación técnica clara y útil para el equipo de diseño.

Genera un documento Markdown para la siguiente pantalla. Sé conciso pero completo. Usa secciones claras.

BRIEF: "${brief}"

COMPOSICIÓN (${components?.length || 0} componentes, score ${score}%):
${compList || '  Sin componentes'}

REGLAS KB APLICADAS:
${kbContext || '  Sin reglas KB específicas'}

Genera el documento con EXACTAMENTE estas secciones en este orden:

## Descripción
Una o dos frases que explican qué hace esta pantalla y para qué sirve.

## Componentes
Lista de componentes con su rol en la pantalla. Formato: \`nombre-componente\` — explicación de por qué está y qué hace.

## Flujo del usuario
Pasos numerados de lo que hace el usuario en esta pantalla. Máximo 5 pasos.

## Reglas aplicadas
Lista de reglas del Design System o del conocimiento del equipo que gobiernan esta pantalla. Si no hay ninguna, escribe "Sin reglas específicas aplicadas."

## Decisiones de diseño
2-3 decisiones clave tomadas al componer esta pantalla y por qué.

---
Responde SOLO con el Markdown, sin texto adicional antes ni después. No uses bloques de código.`;
}

// ─── ROUTE ────────────────────────────────────────────────────────────────────

router.post('/', async function(req, res, next) {
  try {
    const { brief, components, score, kb_rules } = req.body;

    if (!brief || !brief.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    }

    console.log(`  → Generando doc para: "${brief.substring(0, 60)}..." (${components?.length || 0} comps)`);

    const prompt = buildDocPrompt(brief, components, score || 0, kb_rules || []);

    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    });

    const doc = message.content?.[0]?.text || '// Error generando documentación';

    // Añadir cabecera con metadata
    const header = [
      `# Pantalla: ${brief.trim()}`,
      ``,
      `> **Score:** ${score || 0}%  ·  **Generado:** ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}  ·  **Engine:** DS IA-Ready v1.0`,
      ``,
    ].join('\n');

    const fullDoc = header + doc;

    console.log(`  ✓ Doc generada (${fullDoc.length} chars)`);

    res.json({ ok: true, doc: fullDoc });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
