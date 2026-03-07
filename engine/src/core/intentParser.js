// core/intentParser.js
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
Tu única tarea es analizar un brief de diseño y devolver un JSON estructurado.

Los tipos de pantalla disponibles son:
- lista-con-filtros: listados navegables con filtros por categoría
- formulario-simple: captura de datos del usuario (login, registro, edición)
- confirmacion: confirmación de acciones importantes o irreversibles
- detalle: vista de detalle de un item específico

Los componentes disponibles y sus restricciones son:
- navigation-header: máximo 1 por pantalla, siempre primer elemento
- button-primary: máximo 1 por pantalla
- button-secondary: máximo 1 por pantalla
- card-item: mutuamente excluyente con empty-state
- input-text: solo en formularios
- filter-bar: solo en listados, máximo 1
- empty-state: mutuamente excluyente con card-item
- modal-bottom-sheet: máximo 1 por pantalla

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown.
Estructura exacta:
{
  "intent_type": "lista-con-filtros | formulario-simple | confirmacion | detalle",
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
    {
      "rule": "nombre-regla",
      "detail": "explicación",
      "severity": "error | warning"
    }
  ]
}

brief_violations debe ser [] si no hay violaciones.
Ejemplos de violaciones a detectar:
- "3 botones primarios" → error: max-1-button-primary
- "varios CTAs principales" → error: max-1-button-primary
- "filtros en formulario" → warning: filter-bar-in-form
- "card y empty state juntos" → error: card-empty-exclusivity`;

async function parseIntent(brief) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠ Sin ANTHROPIC_API_KEY — fallback keyword');
    return fallbackParse(brief);
  }
  try {
    const anthropic = getClient();
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: 'Brief: "' + brief + '"' }]
    });
    const raw = message.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(clean);
    if (!intent.brief_violations) intent.brief_violations = [];
    const n = intent.brief_violations.length;
    console.log('  ✓ Intent: ' + intent.intent_type + ' (' + intent.domain + ') conf:' + intent.confidence + (n > 0 ? ' ⚠ ' + n + ' violations' : ''));
    return intent;
  } catch (err) {
    console.error('  ✗ IntentParser error:', err.message);
    return fallbackParse(brief);
  }
}

function fallbackParse(brief) {
  const b = brief.toLowerCase();
  let intent_type = 'lista-con-filtros';
  let confidence = 0.50;
  if (b.includes('formulario') || b.includes('login') || b.includes('registr') || b.includes('contraseña') || b.includes('email') || b.includes('campo')) {
    intent_type = 'formulario-simple'; confidence = 0.70;
  } else if (b.includes('confirmar') || b.includes('eliminar') || b.includes('borrar')) {
    intent_type = 'confirmacion'; confidence = 0.70;
  } else if (b.includes('detalle') || b.includes('ficha')) {
    intent_type = 'detalle'; confidence = 0.70;
  } else if (b.includes('lista') || b.includes('filtro') || b.includes('fondos')) {
    intent_type = 'lista-con-filtros'; confidence = 0.75;
  }
  const brief_violations = [];
  if (b.includes('3 botones') || b.includes('varios botones primarios') || b.includes('múltiples cta')) {
    brief_violations.push({ rule: 'max-1-button-primary', detail: 'Solo puede haber 1 button-primary por pantalla.', severity: 'error' });
  }
  return {
    intent_type, domain: 'general', required_capabilities: [],
    constraints: { has_filters: intent_type === 'lista-con-filtros', has_form_fields: intent_type === 'formulario-simple', is_destructive: intent_type === 'confirmacion', needs_confirmation: intent_type === 'confirmacion', estimated_items: null },
    confidence, reasoning: 'Fallback keyword matching', brief_violations
  };
}

module.exports = { parseIntent };
