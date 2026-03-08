const Anthropic = require('@anthropic-ai/sdk');
let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY no configurada');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `Eres el Intent Parser de un Design System IA-Ready.
Analiza el brief y devuelve un JSON estructurado.

Tipos de pantalla disponibles:
- lista-con-filtros: listados navegables con filtros
- formulario-simple: captura de datos (login, registro, edición)
- confirmacion: confirmación de acciones importantes o irreversibles
- detalle: vista de detalle de un item
- dashboard: pantalla resumen con métricas, KPIs, acceso rápido (home, inicio, resumen, overview)

Componentes disponibles y restricciones:
- navigation-header: máximo 1, siempre primero
- button-primary: máximo 1 por pantalla
- button-secondary: máximo 1 por pantalla
- card-item: mutuamente excluyente con empty-state
- input-text: solo en formularios
- filter-bar: solo en listados o dashboard, máximo 1
- empty-state: mutuamente excluyente con card-item
- modal-bottom-sheet: máximo 1 por pantalla

Si el brief menciona elementos que NO existen en el DS (gráficos, mapas, calendarios, sliders, tabs, carousels, listas de navegación bottom, etc.), inclúyelos en missing_components.

Responde ÚNICAMENTE con JSON válido, sin markdown.
Estructura:
{
  "intent_type": "lista-con-filtros | formulario-simple | confirmacion | detalle | dashboard",
  "domain": "string corto",
  "required_capabilities": [],
  "constraints": {
    "has_filters": false,
    "has_form_fields": false,
    "is_destructive": false,
    "needs_confirmation": false,
    "estimated_items": null
  },
  "confidence": 0.0,
  "reasoning": "frase corta",
  "brief_violations": [
    { "rule": "nombre-regla", "detail": "explicación", "severity": "error | warning" }
  ],
  "missing_components": [
    { "name": "nombre-componente", "reason": "por qué se necesitaría y no existe en el DS" }
  ]
}

brief_violations y missing_components deben ser [] si no hay nada.`;

async function parseIntent(brief) {
  if (!process.env.ANTHROPIC_API_KEY) return fallbackParse(brief);
  try {
    const anthropic = getClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Brief: "' + brief + '"' }]
    });
    const raw = message.content[0].text.trim();
    const intent = JSON.parse(raw.replace(/```json|```/g, '').trim());
    if (!intent.brief_violations) intent.brief_violations = [];
    if (!intent.missing_components) intent.missing_components = [];
    const v = intent.brief_violations.length;
    const m = intent.missing_components.length;
    console.log('  ✓ Intent: ' + intent.intent_type + ' (' + intent.domain + ') conf:' + intent.confidence + (v > 0 ? ' ⚠ ' + v + ' violations' : '') + (m > 0 ? ' ✗ ' + m + ' missing' : ''));
    return intent;
  } catch (err) {
    console.error('  ✗ IntentParser error:', err.message);
    return fallbackParse(brief);
  }
}

function fallbackParse(brief) {
  const b = brief.toLowerCase();
  let intent_type = 'lista-con-filtros', confidence = 0.50;
  if (b.includes('dashboard') || b.includes('home') || b.includes('inicio') || b.includes('resumen') || b.includes('métricas') || b.includes('overview')) {
    intent_type = 'dashboard'; confidence = 0.75;
  } else if (b.includes('formulario') || b.includes('login') || b.includes('registr') || b.includes('contraseña') || b.includes('email')) {
    intent_type = 'formulario-simple'; confidence = 0.70;
  } else if (b.includes('confirmar') || b.includes('eliminar') || b.includes('borrar')) {
    intent_type = 'confirmacion'; confidence = 0.70;
  } else if (b.includes('detalle') || b.includes('ficha')) {
    intent_type = 'detalle'; confidence = 0.70;
  } else if (b.includes('lista') || b.includes('filtro') || b.includes('fondos')) {
    intent_type = 'lista-con-filtros'; confidence = 0.75;
  }
  const brief_violations = [];
  if (b.includes('3 botones') || b.includes('varios botones primarios')) {
    brief_violations.push({ rule: 'max-1-button-primary', detail: 'Solo puede haber 1 button-primary por pantalla.', severity: 'error' });
  }
  return {
    intent_type, domain: 'general', required_capabilities: [],
    constraints: { has_filters: false, has_form_fields: intent_type === 'formulario-simple', is_destructive: intent_type === 'confirmacion', needs_confirmation: intent_type === 'confirmacion', estimated_items: null },
    confidence, reasoning: 'Fallback keyword matching', brief_violations, missing_components: []
  };
}

module.exports = { parseIntent };
