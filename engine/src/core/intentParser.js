// core/intentParser.js
// Fase 2+ - Usa Claude API para interpretar el brief en lenguaje natural
// y devolver un IntentObject estructurado + brief_violations[]
// v1.1 - Añade navigation_level al output (L0/L1/L2/L3) según global-rules/navigation.md

const Anthropic = require('@anthropic-ai/sdk');
const { INTENT_TO_LEVEL: NAV_LEVEL_MAP, INTENT_TO_PATTERN } = require('./navigationMaps');

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

// NAV_LEVEL_MAP importado desde navigationMaps.js

// Variante obligatoria del navigation-header por nivel
// Fuente de verdad: engine/contracts/navigation-header.md
const HEADER_VARIANT_MAP = {
  'L0': 'Type=Dashboard',
  'L1': 'Type=Predeterminada',
  'L2': 'Type=Modal',
  'L3': 'Type=Modal',
};

const SYSTEM_PROMPT = `Eres el Intent Parser de un Design System IA-Ready.
Tu única tarea es analizar un brief de diseño y devolver un JSON estructurado.

Los tipos de pantalla disponibles son:
- dashboard: pantalla principal o home con resumen de estado, KPIs, accesos rápidos
- lista-con-filtros: listados navegables con filtros por categoría
- login: acceso a la app con identificador + contraseña. SIEMPRE 2 campos fijos. Usar cuando el brief mencione login, acceder, entrar, iniciar sesión, contraseña, email+password.
- registro: creación de cuenta con N campos variables. Usar cuando el brief mencione registrarse, crear cuenta, alta, nuevo usuario, o liste campos de datos personales.
- edicion-perfil: modificación de datos existentes. Usar cuando el brief mencione editar, modificar, actualizar, cambiar datos del perfil o cuenta.
- formulario-producto: contratación o solicitud de producto financiero. Usar cuando el brief mencione contratar, solicitar, abrir cuenta, configurar producto financiero.
- formulario-default: fallback para formularios no clasificables en los anteriores. Usar solo si no encaja en ninguno de los 4 tipos anteriores.
- confirmacion: confirmación de acciones importantes o irreversibles
- detalle: vista de detalle de un item específico
- onboarding: bienvenida y primeros pasos para nuevo usuario
- perfil-usuario: datos personales, cuenta y configuración del usuario
- error-estado: pantalla de error, sin conexión o estado vacío
- notificaciones: lista de alertas, avisos y mensajes del sistema
- lista-noticias: listado de noticias, artículos o contenido editorial con imagen. Usar cuando el brief mencione noticias, artículos, contenido, publicaciones, posts, novedades. Cada ítem tiene imagen + titular + enlace.
- transferencia-bancaria: flujo MULTIPANTALLA (5 pasos) para envío de dinero entre cuentas. Usar cuando el brief mencione transferir dinero, enviar dinero, pago a tercero, Bizum, SEPA, CLABE, IBAN o mover fondos entre cuentas. NO usar formulario-simple para este caso.

Los componentes disponibles y sus restricciones son:
- navigation-header: máximo 1 por pantalla, siempre primer elemento
- button-primary: máximo 1 por pantalla
- button-secondary: máximo 1 por pantalla
- card-item: mutuamente excluyente con empty-state
- input-text: solo en formularios
- filter-bar: solo en listados, máximo 1
- empty-state: mutuamente excluyente con card-item
- modal-bottom-sheet: máximo 1 por pantalla
- tab-bar: máximo 1. Reglas de nivel de navegación:
  * L0 (dashboard): tab-bar OBLIGATORIO - es la raíz de la app
  * L1 (lista-con-filtros, notificaciones, perfil-usuario): tab-bar OBLIGATORIO - son tabs del app shell
  * L2 (detalle, formulario-simple): tab-bar NUNCA - son pantallas secundarias con back
  * L3 (confirmacion, error-estado): tab-bar NUNCA - son modales o pasos finales
  * onboarding: tab-bar NUNCA - el usuario no está autenticado
- list-header: máximo 3, siempre precede a grupos de card-items
- badge: elemento auxiliar, máximo 3 por pantalla
- notification-banner: máximo 5 en patrón notificaciones, máximo 1 en otros patrones

Jerarquía de navegación - cada intent tiene un nivel fijo:
- L0 (raíz autenticada): dashboard - lleva tab-bar, navigation-header Type=Dashboard (sin título, sin back)
- L1 (tabs del app shell): lista-con-filtros, notificaciones, perfil-usuario - llevan tab-bar, navigation-header Type=Predeterminada
- L2 (pantallas secundarias): detalle, login, registro, edicion-perfil, formulario-producto, formulario-default, transferencia-bancaria - navigation-header Type=Modal con arrow-left, sin tab-bar
- L3 (modales y pasos finales): confirmacion, error-estado - navigation-header Type=Modal sin icono izquierdo, sin tab-bar
- L0 especial: onboarding - sin tab-bar aunque sea L0 (usuario no autenticado aún)

Detecta como violación si el brief pide explícitamente una configuración que contradice el nivel:
- tab-bar en un formulario o confirmación → warning
- navigation-header con back en un dashboard → warning
- Pedir omitir tab-bar en dashboard → warning

Reglas especiales para transferencia-bancaria:
- Este intent genera SIEMPRE 5 pantallas en orden fijo: origen, destino-importe, revision, confirmacion, resultado
- No se puede omitir ninguna pantalla aunque el brief lo pida
- La pantalla de revisión es obligatoria por normativa
- El label del button-primary en la pantalla de confirmación DEBE incluir el importe real

Analiza el brief e identifica si pide algo que viola estas restricciones.

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.
El JSON debe tener exactamente esta estructura:
{
  "intent_type": "dashboard | lista-con-filtros | lista-noticias | login | registro | edicion-perfil | formulario-producto | formulario-default | confirmacion | detalle | onboarding | perfil-usuario | error-estado | notificaciones | transferencia-bancaria",
  "domain": "string corto describiendo el dominio (ej: fondos, login, transacciones)",
  "required_capabilities": ["array de capacidades necesarias"],
  "constraints": {
    "has_filters": boolean,
    "has_form_fields": boolean,
    "is_destructive": boolean,
    "needs_confirmation": boolean,
    "estimated_items": number o null,
    "is_multiscreen_flow": boolean
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
- Pedir card-item y empty-state juntos → error: "card-item y empty-state son mutuamente excluyentes"
- Pedir saltarse la revisión en transferencia → error: "La pantalla de revisión es obligatoria en flujos de transferencia"`;

// Enriquece el intent con navigation_level y header_variant
// basándose en el mapa canónico - no depende de lo que devuelva Claude
function enrichWithNavigation(intent) {
  const level = NAV_LEVEL_MAP[intent.intent_type] || 'L1';
  intent.navigation_level = level;
  intent.header_variant   = HEADER_VARIANT_MAP[level];

  // tab-bar: obligatorio en L0/L1, prohibido en L2/L3 y onboarding
  intent.constraints.requires_tab_bar = (level === 'L0' || level === 'L1') && intent.intent_type !== 'onboarding';
  intent.constraints.forbids_tab_bar  = level === 'L2' || level === 'L3' || intent.intent_type === 'onboarding';

  return intent;
}

async function parseIntent(brief) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠ ANTHROPIC_API_KEY no configurada - usando fallback keyword');
    return fallbackParse(brief);
  }

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 768,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: 'Brief: "' + brief + '"' }
      ]
    });

    const raw   = message.content[0].text.trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(clean);

    // Garantizar campos obligatorios
    if (!intent.brief_violations) intent.brief_violations = [];
    if (!intent.constraints) intent.constraints = {};
    if (intent.intent_type === 'transferencia-bancaria') {
      intent.constraints.is_multiscreen_flow = true;
    }

    // Enriquecer con nivel de navegación (fuente canónica: NAV_LEVEL_MAP)
    enrichWithNavigation(intent);

    const violationCount = intent.brief_violations.length;
    console.log(
      '  ✓ Intent: ' + intent.intent_type +
      ' | nivel: ' + intent.navigation_level +
      ' | header: ' + intent.header_variant +
      ' | domain: ' + intent.domain +
      ' | conf: ' + intent.confidence +
      (violationCount > 0 ? ' ⚠ ' + violationCount + ' violaciones' : '')
    );

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
  let is_multiscreen_flow = false;

  if (b.includes('dashboard') || b.includes('home') || b.includes('inicio') ||
      b.includes('pantalla principal') || b.includes('pantalla de inicio') ||
      b.includes('pantalla home') || b.includes('bienvenida al cliente') ||
      b.includes('resumen de cuenta') || b.includes('vista general') ||
      b.includes('página principal') || b.includes('kpi') ||
      b.includes('accesos rápidos')) {
    intent_type = 'dashboard';
    confidence  = 0.80;
  } else if (b.includes('transferencia') || b.includes('transferir') ||
      b.includes('enviar dinero') || b.includes('pago a tercero') ||
      b.includes('bizum') || b.includes('sepa') ||
      b.includes('mover fondos') || b.includes('mandar dinero') ||
      b.includes('envío de dinero') || b.includes('pagar a')) {
    intent_type = 'transferencia-bancaria';
    confidence  = 0.85;
    is_multiscreen_flow = true;
  } else if (b.includes('login') || b.includes('iniciar sesión') || b.includes('acceder') ||
      b.includes('entrar') || b.includes('contraseña') && b.includes('email')) {
    intent_type = 'login';
    confidence  = 0.85;
  } else if (b.includes('registr') || b.includes('crear cuenta') || b.includes('nuevo usuario') ||
      b.includes('alta') || b.includes('sign up')) {
    intent_type = 'registro';
    confidence  = 0.80;
  } else if (b.includes('editar') || b.includes('modificar') || b.includes('actualizar') ||
      b.includes('cambiar') && (b.includes('perfil') || b.includes('datos') || b.includes('cuenta'))) {
    intent_type = 'edicion-perfil';
    confidence  = 0.80;
  } else if ((b.includes('contratar') || b.includes('solicitar') || b.includes('abrir cuenta') ||
      b.includes('configurar') && b.includes('producto')) &&
      !b.includes('muestra') && !b.includes('detalle') && !b.includes('ver ') &&
      !b.includes('mostrar') && !b.includes('información') && !b.includes('visualiz')) {
    intent_type = 'formulario-producto';
    confidence  = 0.80;
  } else if (b.includes('formulario') || b.includes('campo') || b.includes('guardar datos')) {
    intent_type = 'formulario-default';
    confidence  = 0.65;
  } else if (b.includes('confirmar') || b.includes('confirmación') || b.includes('eliminar') ||
             b.includes('borrar') || b.includes('irreversible')) {
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
             b.includes('ver más') || b.includes('perfil de') ||
             b.includes('valor liquidativo') || b.includes('rentabilidad') ||
             (b.includes('muestra') && (b.includes('fondo') || b.includes('producto') || b.includes('transacci'))) ||
             (b.includes('muestra') && b.includes('fecha')) ||
             (b.includes('nombre del') && (b.includes('fondo') || b.includes('producto')))) {
    intent_type = 'detalle';
    confidence  = 0.80;
  } else if (b.includes('lista') || b.includes('listado') || b.includes('filtro') ||
             b.includes('fondos') || b.includes('transacciones') || b.includes('resultados')) {
    intent_type = 'lista-con-filtros';
    confidence  = 0.75;
  }

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

  if (intent_type === 'transferencia-bancaria' && (b.includes('sin revisión') || b.includes('sin revision') || b.includes('saltar revision'))) {
    brief_violations.push({
      rule: 'revision-obligatoria-transferencia',
      detail: 'La pantalla de revisión es obligatoria en flujos de transferencia. No se puede omitir.',
      severity: 'error'
    });
  }

  const baseIntent = {
    intent_type,
    domain: intent_type === 'transferencia-bancaria' ? 'transferencias'
           : intent_type === 'dashboard' ? 'home'
           : intent_type === 'lista-con-filtros' ? 'listados'
           : intent_type === 'formulario-simple' ? 'formularios'
           : 'general',
    required_capabilities: intent_type === 'transferencia-bancaria' ? ['multi-screen-flow', 'form-validation', 'confirmation'] : [],
    constraints: {
      has_filters:         intent_type === 'lista-con-filtros',
      has_form_fields:     intent_type === 'transferencia-bancaria' || intent_type === 'formulario-simple',
      is_destructive:      intent_type === 'confirmacion' || intent_type === 'transferencia-bancaria',
      needs_confirmation:  intent_type === 'confirmacion' || intent_type === 'transferencia-bancaria',
      estimated_items:     null,
      is_multiscreen_flow: is_multiscreen_flow,
    },
    confidence,
    reasoning: 'Fallback keyword matching - sin Claude API',
    brief_violations
  };

  return enrichWithNavigation(baseIntent);
}

module.exports = { parseIntent };
