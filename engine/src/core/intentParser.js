// core/intentParser.js
// Fase 2+ — Usa Claude API para interpretar el brief en lenguaje natural
// y devolver un IntentObject estructurado + brief_violations[]

const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY no configurada en .env');
    }
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
- onboarding: bienvenida y primeros pasos para nuevo usuario
- perfil-usuario: datos personales, cuenta y configuración del usuario
- error-estado: pantalla de error, sin conexión o estado vacío
- notificaciones: lista de alertas, avisos y mensajes del sistema

Los componentes disponibles y sus restricciones son:
- navigation-header: máximo 1 por pantalla, siempre primer elemento
- button-primary: máximo 1 por pantalla
- button-secondary: máximo 1 por pantalla
- card-item: mutuamente excluyente con empty-state
- input-text: solo en formularios
- filter-bar: solo en listados, máximo 1
- empty-state: mutuamente excluyente con card-item
- modal-bottom-sheet: máximo 1 por pantalla
- tab-bar: máximo 1, solo en pantallas de usuario autenticado, NUNCA en onboarding
- list-header: máximo 3, siempre precede a grupos de card-items
- badge: elemento auxiliar, máximo 3 por pantalla
- notification-banner: máximo 5 en patrón notificaciones, máximo 1 en otros patrones

Analiza el brief e identifica si pide algo que viola estas restricciones.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.
El JSON debe tener exactamente esta estructura:
{
  "intent_type": "lista-con-filtros | formulario-simple | confirmacion | detalle | onboarding | perfil-usuario | error-estado | notificaciones",
  "domain": "string corto describiendo el dominio (ej: fondos, login, transacciones)",
  "required_capabilities": ["array de capacidades necesarias"],
  "constraints": {
    "has_filters": boolean,
    "has_form_fields": boolean,
    "is_destructive": boolean,
    "needs_confirmation": boolean,
    "estimated_items": number o null
  },
  "confidence": número entre 0 y 1,
  "reasoning": "una frase corta explicando la decisión",
  "brief_violations": [
    {
      "rule": "nombre corto de la regla violada",
      "detail": "explicación clara de por qué viola el Design System",
      "severity": "error | warning"
    }
  ]
}

brief_violations debe ser un array vacío [] si no hay violaciones.
Ejemplos de violaciones:
- Pedir 3 botones primarios → error: "Max 1 button-primary por pantalla"
- Pedir navigation-header al final → error: "navigation-header siempre es el primer elemento"
- Pedir filtros en un formulario → warning: "filter-bar no se usa en formularios"
- Pedir card-item y empty-state juntos → error: "card-item y empty-state son mutuamente excluyentes"`;

async function parseIntent(brief) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠ ANTHROPIC_API_KEY no configurada — usando fallback keyword');
    return fallbackParse(brief);
  }

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Brief: "' + brief + '"' }
      ]
    });

    const raw = message.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(clean);

    // Asegurar que brief_violations siempre existe
    if (!intent.brief_violations) {
      intent.brief_violations = [];
    }

    const violationCount = intent.brief_violations.length;
    console.log('  ✓ Intent parseado: ' + intent.intent_type + ' (' + intent.domain + ') confidence: ' + intent.confidence + (violationCount > 0 ? ' ⚠ ' + violationCount + ' violaciones' : ''));

    return intent;

  } catch (err) {
    console.error('  ✗ Error en Intent Parser:', err.message);
    console.log('  → Usando fallback keyword matching');
    return fallbackParse(brief);
  }
}

// Fallback keyword-based + detección básica de violaciones
function fallbackParse(brief) {
  const b = brief.toLowerCase();

  let intent_type = 'lista-con-filtros';
  let confidence  = 0.50;

  if (b.includes('formulario') || b.includes('login') || b.includes('registr') ||
      b.includes('contraseña') || b.includes('email') || b.includes('campo') ||
      b.includes('editar') || b.includes('guardar datos')) {
    intent_type = 'formulario-simple';
    confidence  = 0.70;
  } else if (b.includes('confirmar') || b.includes('confirmación') || b.includes('eliminar') ||
             b.includes('borrar') || b.includes('enviar dinero') || b.includes('irreversible')) {
    intent_type = 'confirmacion';
    confidence  = 0.70;
  } else if (b.includes('onboarding') || b.includes('bienvenida') || b.includes('bienvenido') ||
             b.includes('primeros pasos') || b.includes('nuevo usuario') || b.includes('introducción')) {
    intent_type = 'onboarding';
    confidence  = 0.75;
  } else if (b.includes('mi perfil') || b.includes('perfil de usuario') || b.includes('mis datos') ||
             b.includes('mi cuenta') || b.includes('datos personales') || b.includes('configuración')) {
    intent_type = 'perfil-usuario';
    confidence  = 0.75;
  } else if (b.includes('error') || b.includes('sin conexión') || b.includes('algo salió mal') ||
             b.includes('fallo') || b.includes('no encontrado') || b.includes('estado vacío')) {
    intent_type = 'error-estado';
    confidence  = 0.75;
  } else if (b.includes('notificaciones') || b.includes('alertas') || b.includes('avisos') ||
             b.includes('mensajes del sistema') || b.includes('actividad reciente')) {
    intent_type = 'notificaciones';
    confidence  = 0.75;
  } else if (b.includes('detalle') || b.includes('ficha') || b.includes('información de') ||
             b.includes('ver más') || b.includes('perfil de')) {
    intent_type = 'detalle';
    confidence  = 0.70;
  } else if (b.includes('lista') || b.includes('listado') || b.includes('filtro') ||
             b.includes('fondos') || b.includes('transacciones') || b.includes('resultados')) {
    intent_type = 'lista-con-filtros';
    confidence  = 0.75;
  }

  // Detección básica de violaciones en fallback
  const brief_violations = [];

  const buttonPrimaryCount = (b.match(/botón primario|button.?primary|cta principal/g) || []).length;
  if (buttonPrimaryCount > 1 || b.includes('3 botones') || b.includes('varios botones primarios')) {
    brief_violations.push({
      rule: 'max-1-button-primary',
      detail: 'Solo puede haber 1 button-primary por pantalla. El brief solicita múltiples.',
      severity: 'error'
    });
  }

  if ((b.includes('card') || b.includes('tarjeta')) && (b.includes('empty') || b.includes('vacío') || b.includes('sin resultados'))) {
    brief_violations.push({
      rule: 'card-empty-exclusivity',
      detail: 'card-item y empty-state son mutuamente excluyentes. No pueden coexistir en la misma pantalla.',
      severity: 'error'
    });
  }

  if (b.includes('filtro') && intent_type === 'formulario-simple') {
    brief_violations.push({
      rule: 'filter-bar-in-form',
      detail: 'filter-bar no se usa en pantallas de formulario.',
      severity: 'warning'
    });
  }

  return {
    intent_type,
    domain:   'general',
    required_capabilities: [],
    constraints: {
      has_filters:       intent_type === 'lista-con-filtros',
      has_form_fields:   intent_type === 'formulario-simple',
      is_destructive:    intent_type === 'confirmacion',
      needs_confirmation: intent_type === 'confirmacion',
      estimated_items:   null
    },
    confidence,
    reasoning: 'Fallback keyword matching — sin Claude API',
    brief_violations
  };
}

module.exports = { parseIntent };
