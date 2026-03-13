// core/intentParser.js
// Fase 2+ — Usa Claude API para interpretar el brief en lenguaje natural
// y devolver un IntentObject estructurado + brief_violations[]
// ─────────────────────────────────────────────────────────────────────────────
// MEJORAS v1.1:
//   - IP-01: Añadidos 4 componentes faltantes (tab-bar, list-header, badge, notification-banner)
//   - IP-02: Constraints extendidos: geography, needs_auth, risk_profile, user_segment, is_first_time
//   - IP-03: Ejemplos de violaciones del dominio financiero
//   - IP-04: max_tokens subido a 1024 + manejo de stop_reason max_tokens
//   - IP-05: Dominios canónicos normalizados

'use strict';
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

// ── DOMINIOS CANÓNICOS ────────────────────────────────────────────────────────
// El modelo usará siempre uno de estos valores para el campo "domain"
const CANONICAL_DOMAINS = [
  'fondos', 'transacciones', 'kyc', 'perfil', 'mercado', 'cartera',
  'onboarding', 'auth', 'transferencias', 'inversiones', 'dashboard',
  'notificaciones', 'configuracion', 'productos', 'saldo',
];

const SYSTEM_PROMPT = `Eres el Intent Parser de un Design System IA-Ready para productos financieros digitales en Latinoamérica.
Tu única tarea es analizar un brief de diseño y devolver un JSON estructurado.

DOMINIOS CANÓNICOS — usa SIEMPRE uno de estos valores para el campo "domain":
fondos · transacciones · kyc · perfil · mercado · cartera · onboarding · auth · transferencias · inversiones · dashboard · notificaciones · configuracion · productos · saldo

Si el brief no encaja en ninguno, elige el más cercano semánticamente.

TIPOS DE PANTALLA DISPONIBLES:
- lista-con-filtros: listados navegables con filtros por categoría (fondos, transacciones, posiciones)
- formulario-simple: captura de datos del usuario (login, registro, KYC, transferencias, edición de perfil)
- confirmacion: confirmación de acciones importantes o irreversibles (transferir, eliminar, autorizar)
- detalle: vista de detalle de un item específico (fondo, transacción, posición de cartera)
- onboarding: bienvenida y primeros pasos para nuevo usuario (alta, tutorial, configuración inicial)
- perfil-usuario: datos personales, cuenta y configuración del usuario
- error-estado: SOLO si el brief describe EXPLÍCITAMENTE una pantalla de error, fallo técnico, sin conexión o acceso denegado como PROPÓSITO PRINCIPAL. NO usar si el brief describe una pantalla funcional que podría tener un estado vacío como caso secundario (ej: lista que puede estar vacía → usar lista-con-filtros)
- notificaciones: lista de alertas, avisos y mensajes del sistema

COMPONENTES DISPONIBLES Y SUS RESTRICCIONES:
- navigation-header: máximo 1 por pantalla, SIEMPRE primer elemento, obligatorio en todos los patrones
- button-primary: máximo 1 por pantalla
- button-secondary: máximo 1 por pantalla
- card-item: mutuamente excluyente con empty-state
- input-text: preferentemente en formularios (puede aparecer en otros contextos de búsqueda)
- filter-bar: solo en listados, máximo 1
- empty-state: SOLO si el propósito PRINCIPAL de la pantalla es mostrar un estado vacío o de error. NO incluir si hay card-items posibles. Mutuamente excluyente con card-item
- modal-bottom-sheet: máximo 1 por pantalla, solo en confirmaciones o acciones destructivas
- tab-bar: máximo 1, solo en pantallas de usuario AUTENTICADO, NUNCA en onboarding ni formularios
- list-header: máximo 3 por pantalla, SIEMPRE precede a un grupo de card-items
- badge: elemento auxiliar de estado o variación, máximo 5 por pantalla
- notification-banner: máximo 5 en patrón notificaciones, máximo 1 en cualquier otro patrón

CONSTRAINTS ADICIONALES A DETECTAR:
- geography: si el brief menciona un país o región (colombia, mexico, spain, latam, argentina...)
- needs_auth: si la pantalla requiere que el usuario esté autenticado (cartera, perfil, historial...)
- risk_profile: SOLO si el brief menciona EXPLÍCITAMENTE productos de inversión, fondos o perfil de riesgo. NO activar solo por dominio inferido.
- user_segment: si se especifica un segmento de usuario (new=nuevo, returning=recurrente, premium, no-kyc=sin verificar)
- is_first_time: si es primera visita, bienvenida, flujo de alta o tutorial

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.
El JSON debe tener EXACTAMENTE esta estructura:
{
  "intent_type": "lista-con-filtros | formulario-simple | confirmacion | detalle | onboarding | perfil-usuario | error-estado | notificaciones",
  "domain": "uno de los dominios canónicos listados arriba",
  "required_capabilities": ["array de capacidades necesarias"],
  "constraints": {
    "has_filters": boolean,
    "has_form_fields": boolean,
    "is_destructive": boolean,
    "needs_confirmation": boolean,
    "estimated_items": number o null,
    "geography": "colombia | mexico | spain | latam | argentina | null",
    "needs_auth": boolean,
    "risk_profile": boolean,
    "user_segment": "new | returning | premium | no-kyc | null",
    "is_first_time": boolean
  },
  "confidence": número entre 0 y 1,
  "reasoning": "una frase corta explicando la decisión",
  "brief_violations": [
    {
      "rule": "nombre corto de la regla violada",
      "detail": "explicación clara de por qué viola el Design System o la normativa",
      "severity": "error | warning"
    }
  ]
}

brief_violations debe ser un array vacío [] si no hay violaciones.

EJEMPLOS DE VIOLACIONES EN DOMINIO FINANCIERO:
- Brief menciona "fondos de inversión para usuario sin perfil de riesgo" → warning: "Mostrar productos de inversión sin verificar perfil de riesgo puede incumplir normativa CNBV/Colombia. Considerar empty-state con CTA de completar perfil."
- Brief pide "3 botones primarios" → error: "Max 1 button-primary por pantalla. Usar button-secondary para acciones secundarias."
- Brief pide "filtros en formulario de KYC" → warning: "filter-bar no aplica en formularios de captura de datos."
- Brief pide "transferencia sin paso de confirmación" → warning: "Las acciones irreversibles de dinero requieren modal-bottom-sheet de confirmación por decisión del DS (mayo 2023)."
- Brief pide "tab-bar en pantalla de bienvenida" → error: "tab-bar NUNCA en flujo de onboarding — el usuario no está autenticado."
- Brief pide "card-item y empty-state juntos" → error: "card-item y empty-state son mutuamente excluyentes en la misma pantalla."
- Brief pide "notification-banner y card-item en pantalla de listado" → no es violación (banner informa, cards listan).`;

// ── PARSEO PRINCIPAL ──────────────────────────────────────────────────────────
async function parseIntent(brief) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠ ANTHROPIC_API_KEY no configurada — usando fallback keyword');
    return fallbackParse(brief);
  }

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,  // IP-04: subido de 768 a 1024
      system:     SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Brief: "' + brief + '"' }
      ],
    });

    // IP-04: manejo explícito de truncado
    if (message.stop_reason === 'max_tokens') {
      console.warn('  ⚠ IntentParser: respuesta truncada (max_tokens) — usando fallback');
      return fallbackParse(brief);
    }

    const raw   = message.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(clean);

    // Garantizar campos obligatorios
    if (!intent.brief_violations) intent.brief_violations = [];
    if (!intent.constraints)      intent.constraints = {};

    // Normalizar domain al canónico más cercano si no es canónico
    if (!CANONICAL_DOMAINS.includes(intent.domain)) {
      const original = intent.domain;
      intent.domain = normalizeDomain(intent.domain);
      if (intent.domain !== original) {
        console.log('  → domain normalizado: "' + original + '" → "' + intent.domain + '"');
      }
    }

    // Garantizar constraints nuevos con defaults seguros
    const c = intent.constraints;
    if (c.geography       === undefined) c.geography     = null;
    if (c.needs_auth      === undefined) c.needs_auth     = false;
    if (c.risk_profile    === undefined) c.risk_profile   = false;
    if (c.user_segment    === undefined) c.user_segment   = null;
    if (c.is_first_time   === undefined) c.is_first_time  = false;

    const violationCount = intent.brief_violations.length;
    console.log(
      '  ✓ Intent parseado: ' + intent.intent_type +
      ' (' + intent.domain + ')' +
      ' confidence: ' + intent.confidence +
      (c.geography    ? ' geo:' + c.geography : '') +
      (c.risk_profile ? ' risk_profile:true' : '') +
      (violationCount > 0 ? ' violations:' + violationCount : '')
    );

    return intent;

  } catch (err) {
    console.warn('  ⚠ IntentParser error: ' + err.message + ' — usando fallback');
    return fallbackParse(brief);
  }
}

// ── NORMALIZAR DOMAIN ─────────────────────────────────────────────────────────
// Si Claude devuelve un dominio no canónico, lo mapea al más cercano
function normalizeDomain(raw) {
  if (!raw) return 'dashboard';
  const b = raw.toLowerCase();
  if (b.includes('fondo') || b.includes('fund'))          return 'fondos';
  if (b.includes('transacc') || b.includes('operac'))     return 'transacciones';
  if (b.includes('kyc') || b.includes('verific') || b.includes('identid')) return 'kyc';
  if (b.includes('perfil') || b.includes('profile') || b.includes('cuenta')) return 'perfil';
  if (b.includes('mercado') || b.includes('market'))      return 'mercado';
  if (b.includes('cartera') || b.includes('portfolio'))   return 'cartera';
  if (b.includes('onboarding') || b.includes('bienven'))  return 'onboarding';
  if (b.includes('login') || b.includes('auth') || b.includes('sesión')) return 'auth';
  if (b.includes('transfer'))                              return 'transferencias';
  if (b.includes('invers'))                                return 'inversiones';
  if (b.includes('notif') || b.includes('alerta'))         return 'notificaciones';
  if (b.includes('config') || b.includes('ajuste'))        return 'configuracion';
  if (b.includes('product') || b.includes('servic'))       return 'productos';
  if (b.includes('saldo') || b.includes('balance'))        return 'saldo';
  if (b.includes('dashboard') || b.includes('resumen'))    return 'dashboard';
  return raw; // mantener si no matchea nada
}

// ── FALLBACK SIN API ──────────────────────────────────────────────────────────
function fallbackParse(brief) {
  const b = brief.toLowerCase();
  let intent_type = 'lista-con-filtros';
  let domain      = 'dashboard';

  if (b.includes('login') || b.includes('registro') || b.includes('kyc') || b.includes('formulario')) {
    intent_type = 'formulario-simple'; domain = b.includes('kyc') ? 'kyc' : 'auth';
  } else if (b.includes('confirm') || b.includes('eliminar') || b.includes('borrar') || b.includes('transferi')) {
    intent_type = 'confirmacion'; domain = b.includes('transferi') ? 'transferencias' : 'perfil';
  } else if (b.includes('detalle') || b.includes('vista de')) {
    intent_type = 'detalle';
    if (b.includes('fondo')) domain = 'fondos';
    else if (b.includes('transacc')) domain = 'transacciones';
  } else if (b.includes('onboarding') || b.includes('bienven')) {
    intent_type = 'onboarding'; domain = 'onboarding';
  } else if (b.includes('perfil') || b.includes('configurac')) {
    intent_type = 'perfil-usuario'; domain = 'perfil';
  } else if (b.includes('error') || b.includes('sin conexión') || b.includes('vacío')) {
    intent_type = 'error-estado'; domain = 'dashboard';
  } else if (b.includes('notificac') || b.includes('alerta')) {
    intent_type = 'notificaciones'; domain = 'notificaciones';
  } else {
    if (b.includes('fondo')) domain = 'fondos';
    else if (b.includes('transacc')) domain = 'transacciones';
    else if (b.includes('cartera') || b.includes('portfo')) domain = 'cartera';
    else if (b.includes('mercado')) domain = 'mercado';
    else if (b.includes('invers')) domain = 'inversiones';
  }

  return {
    intent_type,
    domain,
    required_capabilities: [],
    constraints: {
      has_filters:      b.includes('filtro') || b.includes('filter'),
      has_form_fields:  b.includes('formulario') || b.includes('campo') || b.includes('input'),
      is_destructive:   b.includes('eliminar') || b.includes('borrar') || b.includes('cerrar cuenta'),
      needs_confirmation: b.includes('confirm') || b.includes('¿estás seguro'),
      estimated_items:  null,
      geography:        b.includes('colombia') ? 'colombia' : b.includes('méxico') || b.includes('mexico') ? 'mexico' : b.includes('españa') || b.includes('spain') ? 'spain' : null,
      needs_auth:       !b.includes('login') && !b.includes('registro') && !b.includes('onboarding'),
      risk_profile:     b.includes('perfil de riesgo') || b.includes('fondo de invers') || b.includes('producto de invers'),
      user_segment:     b.includes('nuevo usuario') ? 'new' : b.includes('premium') ? 'premium' : null,
      is_first_time:    b.includes('primera') || b.includes('bienven') || b.includes('onboarding'),
    },
    confidence:    0.55,
    reasoning:     'Fallback keyword — API no disponible',
    brief_violations: [],
  };
}

module.exports = { parseIntent };
