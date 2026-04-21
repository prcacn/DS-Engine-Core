'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// UX WRITER AGENT
// Recibe los componentes estructurales y genera el copy real de cada uno.
// También interpreta las reglas KB para ajustar el tono y el mensaje.
// ─────────────────────────────────────────────────────────────────────────────

const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic();

// Props de texto que cada componente puede recibir
const COMPONENT_TEXT_PROPS = {
  'navigation-header':   ['title', 'subtitle'],
  'filter-bar':          ['filters'],               // array de strings
  'card-item':           ['title', 'subtitle', 'value', 'badge_label', 'metadata'],
  'button-primary':      ['label'],
  'button-secondary':    ['label'],
  'empty-state':         ['title', 'description', 'action_label'],
  'notification-banner': ['title', 'message', 'action_label'],
  'input-text':          ['label', 'placeholder', 'helper_text'],
  'list-header':         ['title', 'action_label'],
  'modal-bottom-sheet':  ['title', 'description', 'confirm_label', 'cancel_label'],
  'tab-bar':             ['tabs'],                  // array de strings
  'badge':               ['label'],
};

async function runUXWriterAgent({ brief, components, intent, kbRules }) {
  // Construir contexto KB para el writer - solo reglas de contenido relevantes
  const kbContext = kbRules && kbRules.length > 0
    ? '\n\nCONTEXTO ORGANIZACIONAL (reglas de contenido y tono que DEBES respetar):\n' +
      kbRules.map(r =>
        `[${r.categoria?.toUpperCase()} · ${r.prioridad}] ${r.content}`
      ).join('\n')
    : '';

  // Construir lista de componentes con sus props disponibles
  const componentList = components.map(c => {
    const textProps = COMPONENT_TEXT_PROPS[c.component] || [];
    return `- ${c.component} (order: ${c.order})${textProps.length ? ' → props: ' + textProps.join(', ') : ''}`;
  }).join('\n');

  const prompt = `Eres un UX Writer especialista en productos financieros digitales para Latinoamérica.

BRIEF DEL PRODUCTO:
"${brief}"

DOMINIO DETECTADO: ${intent.domain || 'fintech'}
TIPO DE PANTALLA: ${intent.intent_type || 'desconocido'}
${kbContext}

COMPONENTES A RELLENAR:
${componentList}

Tu tarea: genera el copy real y específico para cada componente según el brief.
Sé concreto, natural y alineado con el dominio financiero. Nada de placeholders ni texto genérico.

Reglas de escritura:
- Títulos: cortos, claros, máximo 4 palabras
- Subtítulos: informativos, máximo 8 palabras  
- CTAs: verbos de acción directos ("Ver detalle", "Invertir ahora", "Confirmar transferencia")
- Filtros: etiquetas cortas, reflejan las categorías reales del dominio
- Mensajes vacíos: empáticos y con CTA de acción
- Errores/avisos: claros, sin tecnicismos, con siguiente paso
- Tabs: máximo 12 caracteres por tab
- Si hay una RESTRICCION de alta prioridad en el contexto organizacional, el copy debe reflejarla - 
  por ejemplo si el usuario no puede acceder a algo, el mensaje debe explicar por qué y qué hacer

Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown, sin explicaciones.
Estructura exacta:
{
  "components": [
    {
      "component": "nombre-del-componente",
      "order": número,
      "copy": {
        "prop_name": "valor"
      },
      "writer_note": "decisión de contenido en 1 frase"
    }
  ],
  "tone_rationale": "tono general elegido y por qué"
}

Para props que sean arrays (filters, tabs), usa arrays JSON: ["Todos", "Renta fija", "Acciones"]`;

  try {
    const response = await client.messages.create({
      model:      process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw  = response.content[0].text.trim();
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);

    console.log('  [UXWriter] ✓ copy generado para ' + (parsed.components?.length || 0) + ' componentes | tono: ' + (parsed.tone_rationale?.substring(0, 60) || '-'));
    return parsed;

  } catch (err) {
    console.warn('  [UXWriter] ⚠ error:', err.message);
    // Fallback: devolver componentes sin modificar
    return {
      components: components.map(c => ({ component: c.component, order: c.order, copy: {}, writer_note: 'fallback' })),
      tone_rationale: 'fallback - error en agente',
    };
  }
}

module.exports = { runUXWriterAgent };
