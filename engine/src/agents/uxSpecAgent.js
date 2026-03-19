'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// UX SPEC AGENT
// Revisa la composición generada por el Arquitecto y aplica criterio de UX:
// jerarquía visual, flujo de interacción, estados de componentes.
// También interpreta las reglas KB desde una perspectiva de experiencia de usuario.
// ─────────────────────────────────────────────────────────────────────────────

const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic();

// Variantes válidas por componente
const COMPONENT_VARIANTS = {
  'navigation-header':   ['default', 'back', 'close', 'transparent'],
  'filter-bar':          ['chips', 'tabs', 'dropdown'],
  'card-item':           ['default', 'compact', 'expanded', 'highlighted', 'disabled'],
  'button-primary':      ['default', 'destructive', 'loading', 'disabled'],
  'button-secondary':    ['default', 'destructive', 'outline'],
  'empty-state':         ['default', 'error', 'no-results', 'cta', 'locked'],
  'notification-banner': ['info', 'success', 'warning', 'error'],
  'input-text':          ['default', 'error', 'disabled', 'password', 'numeric'],
  'list-header':         ['default', 'collapsible', 'with-action'],
  'modal-bottom-sheet':  ['default', 'destructive', 'info'],
  'tab-bar':             ['default', 'with-badge'],
  'badge':               ['positive', 'negative', 'neutral', 'warning'],
};

async function runUXSpecAgent({ brief, components, intent, kbRules }) {
  const kbContext = kbRules && kbRules.length > 0
    ? '\n\nREGLAS ORGANIZACIONALES (considera estas reglas al evaluar el flujo y los estados):\n' +
      kbRules.map(r =>
        `[${r.categoria?.toUpperCase()} · ${r.prioridad}] ${r.content}`
      ).join('\n')
    : '';

  const componentList = components.map(c => {
    const variants = COMPONENT_VARIANTS[c.component] || ['default'];
    return `- order ${c.order}: ${c.component} | variante actual: "${c.variant || 'default'}" | variantes disponibles: ${variants.join(', ')}`;
  }).join('\n');

  const prompt = `Eres un UX Specialist senior especializado en apps financieras móviles (iOS).

BRIEF:
"${brief}"

TIPO DE PANTALLA: ${intent.intent_type || 'desconocido'}
DOMINIO: ${intent.domain || 'fintech'}
CONSTRAINTS DETECTADOS: ${JSON.stringify(intent.constraints || {})}
${kbContext}

COMPOSICIÓN ACTUAL:
${componentList}

Tu tarea: revisar la composición desde el punto de vista de UX y proponer ajustes.

Evalúa y decide para cada componente:
1. VARIANTE correcta según el contexto (ej: button-primary → "destructive" si la acción es irreversible)
2. ESTADO inicial (activo, deshabilitado, cargando, vacío)  
3. Si hay reglas KB con restricciones de acceso → el componente afectado debe tener variante "locked" o "disabled" con explicación
4. Si falta algún componente crítico para el flujo → sugiérelo como "missing_ux_element"
5. ORDEN de los componentes — si la jerarquía actual no es óptima, propón reordenación

Reglas UX que siempre aplican:
- Navigation header siempre primero (order 1)
- Tab bar siempre último si existe  
- Los CTAs primarios deben estar en la parte baja de la pantalla
- Si hay restricción de acceso (KB), mostrar el bloqueo con claridad — variante "locked" o "cta" en empty-state
- En flujos de confirmación, el botón destructivo tiene variante "destructive"
- Notificaciones de advertencia van siempre debajo del header

Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown, sin explicaciones.
Estructura exacta:
{
  "components": [
    {
      "component": "nombre-del-componente",
      "order": número,
      "variant": "variante-elegida",
      "state": "active | disabled | loading | empty | locked",
      "ux_note": "decisión de UX en 1 frase"
    }
  ],
  "missing_ux_elements": [
    {
      "component": "nombre-componente",
      "reason": "por qué hace falta",
      "suggested_order": número
    }
  ],
  "flow_rationale": "lógica de flujo general en 1-2 frases"
}`;

  try {
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw    = response.content[0].text.trim();
    const clean  = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(clean);

    console.log('  [UXSpec]   ✓ variantes ajustadas | faltantes sugeridos: ' + (parsed.missing_ux_elements?.length || 0));
    return parsed;

  } catch (err) {
    console.warn('  [UXSpec]   ⚠ error:', err.message);
    return {
      components: components.map(c => ({ component: c.component, order: c.order, variant: c.variant || 'default', state: 'active', ux_note: 'fallback' })),
      missing_ux_elements: [],
      flow_rationale: 'fallback — error en agente',
    };
  }
}

module.exports = { runUXSpecAgent };
