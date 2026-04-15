// intentParser v2 — build 1776284895
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
Tu única tarea es clasificar un brief de diseño en uno de los tipos disponibles y devolver un JSON.

TIPOS DE PANTALLA — lee las condiciones de uso con atención:

- dashboard: pantalla raíz con saldo, KPIs o resumen de estado. Keywords: dashboard, home, inicio (sin "iniciar sesión"), accesos rápidos, posición global, saldo disponible.
- lista-con-filtros: listado navegable con chips de filtrado. Keywords: lista, listado, fondos, transacciones, movimientos, ver mis, quiero ver.
- login: pantalla de acceso con 2 campos fijos. Keywords: login, iniciar sesión, acceder, contraseña + email/usuario.
- registro: crear cuenta con N campos variables. Keywords: registrarse, crear cuenta, alta, sign up.
- edicion-perfil: modificar datos existentes. Keywords: editar, modificar, actualizar, cambiar datos del perfil.
- formulario-producto: solicitar o contratar un producto financiero (sin contexto de visualización). Keywords: contratar, solicitar, abrir cuenta, configurar producto.
- formulario-default: formulario que no encaja en los anteriores.
- confirmacion: confirmar o cancelar una acción importante. Keywords: confirmar, confirmación, eliminar, borrar, antes de borrar, autorizar, irreversible.
- detalle: ver información completa de un item. Keywords: detalle, ficha, ver transacción, información de, rentabilidad, valor liquidativo, nombre del fondo.
- onboarding: bienvenida y primeros pasos. Keywords: onboarding, bienvenida, bienvenido, primeros pasos, nuevo usuario (sin "registrar").
- perfil-usuario: datos personales y configuración. Keywords: mi perfil, perfil de usuario, mis datos, mi cuenta, datos personales, configuración.
- error-estado: error, sin conexión o estado vacío. Keywords: error, sin conexión, algo salió mal, fallo, no encontrado, estado vacío, acceso restringido, sin resultados, no carga.
- notificaciones: lista de alertas y avisos del sistema. Keywords: notificaciones, alertas, avisos, alertas recientes, centro de notificaciones.
- lista-noticias: listado de artículos con imagen. Keywords: noticias, artículos, publicaciones, posts, novedades.
- transferencia-bancaria: SOLO para envío explícito de dinero entre cuentas. Keywords OBLIGATORIAS: transferir dinero, enviar dinero, pago a tercero, Bizum, SEPA, CLABE, IBAN, mover fondos. NO usar para login, error, notificaciones, perfil ni ningún otro tipo.

REGLA CRÍTICA — transferencia-bancaria:
Solo clasifica como transferencia-bancaria si el brief menciona EXPLÍCITAMENTE mover dinero de una cuenta a otra.
"login", "error", "notificaciones", "perfil", "detalle", "confirmar borrar cuenta" NUNCA son transferencia-bancaria.
Si tienes dudas entre transferencia-bancaria y otro tipo, elige el otro tipo.

REGLA DE FALLBACK:
Si el brief no encaja claramente en ningún tipo específico, usa lista-con-filtros. Nunca uses transferencia-bancaria como fallback.

Jerarquía de navegación:
- L0: dashboard
- L1: lista-con-filtros, notificaciones, perfil-usuario
- L2: detalle, login, registro, edicion-perfil, formulario-producto, formulario-default, transferencia-bancaria
- L3: confirmacion, error-estado
- especial: onboarding (sin tab-bar)

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown.
Estructura exacta:
{
  "intent_type": "uno de los tipos listados arriba",
  "domain": "string corto del dominio (fondos, login, transacciones...)",
  "required_capabilities": ["array de capacidades"],
  "constraints": {
    "has_filters": boolean,
    "has_form_fields": boolean,
    "is_destructive": boolean,
    "needs_confirmation": boolean,
    "estimated_items": number o null,
    "is_multiscreen_flow": boolean
  },
  "confidence": número entre 0 y 1,
  "reasoning": "una frase explicando la decisión",
  "brief_violations": []
}

Ejemplos de violaciones (brief_violations):
- Pedir 3 botones primarios → error: "Max 1 button-primary por pantalla"
- Pedir filtros en un formulario → warning: "filter-bar no se usa en formularios"
- Pedir card-item y empty-state juntos → error: "mutuamente excluyentes"
- Pedir omitir pantalla de revisión en transferencia → error: "obligatoria por normativa"

brief_violations debe ser [] si no hay violaciones.`

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
// v2 — orden de prioridad corregido, operadores && con paréntesis explícitos
function fallbackParse(brief) {
  const b = brief.toLowerCase();

  let intent_type = 'lista-con-filtros'; // default seguro
  let confidence  = 0.50;
  let is_multiscreen_flow = false;

  // ── 1. DASHBOARD ─────────────────────────────────────────────────────────
  if (b.includes('dashboard') || b.includes('home') ||
      b.includes('pantalla principal') || b.includes('pantalla de inicio') ||
      b.includes('pantalla home') || b.includes('bienvenida al cliente') ||
      b.includes('resumen de cuenta') || b.includes('vista general') ||
      b.includes('página principal') || b.includes('kpi') ||
      b.includes('accesos rápidos') || b.includes('saldo disponible') ||
      b.includes('posición global') ||
      (b.includes('inicio') && !b.includes('iniciar sesión'))) {
    intent_type = 'dashboard';
    confidence  = 0.80;

  // ── 2. ONBOARDING — antes que registro para capturar "bienvenida" ────────
  } else if (b.includes('onboarding') || b.includes('bienvenida') ||
             b.includes('bienvenido') || b.includes('primeros pasos') ||
             b.includes('introducción') || b.includes('pantalla de inicio de sesión') ||
             (b.includes('nuevo usuario') && !b.includes('registr'))) {
    intent_type = 'onboarding';
    confidence  = 0.75;

  // ── 3. TRANSFERENCIA — solo keywords de movimiento de dinero ────────────
  } else if (b.includes('transferencia') || b.includes('transferir') ||
             b.includes('enviar dinero') || b.includes('pago a tercero') ||
             b.includes('bizum') || b.includes('sepa') ||
             b.includes('mover fondos') || b.includes('mandar dinero') ||
             b.includes('envío de dinero') || b.includes('pagar a')) {
    intent_type = 'transferencia-bancaria';
    confidence  = 0.85;
    is_multiscreen_flow = true;

  // ── 4. LOGIN — paréntesis explícitos en el &&  ───────────────────────────
  } else if (b.includes('login') || b.includes('iniciar sesión') ||
             b.includes('acceder') || b.includes('entrar a la app') ||
             (b.includes('contraseña') && b.includes('email')) ||
             (b.includes('contraseña') && b.includes('usuario'))) {
    intent_type = 'login';
    confidence  = 0.85;

  // ── 5. CONFIRMACIÓN — antes que registro/edición ────────────────────────
  } else if (b.includes('confirmar') || b.includes('confirmación') ||
             b.includes('eliminar') || b.includes('borrar') ||
             b.includes('irreversible') || b.includes('autorizar') ||
             (b.includes('antes de') && b.includes('cuenta'))) {
    intent_type = 'confirmacion';
    confidence  = 0.75;

  // ── 6. ERROR / ESTADO VACÍO ──────────────────────────────────────────────
  } else if (b.includes('error') || b.includes('sin conexión') ||
             b.includes('algo salió mal') || b.includes('fallo') ||
             b.includes('no encontrado') || b.includes('estado vacío') ||
             b.includes('sin resultados') || b.includes('no hay') ||
             b.includes('acceso restringido') || b.includes('bloqueado') ||
             (b.includes('cargar') && b.includes('conexión')) ||
             (b.includes('cargar') && b.includes('error'))) {
    intent_type = 'error-estado';
    confidence  = 0.75;

  // ── 7. NOTIFICACIONES ────────────────────────────────────────────────────
  } else if (b.includes('notificaciones') || b.includes('alertas') ||
             b.includes('avisos') || b.includes('mensajes del sistema') ||
             b.includes('actividad reciente') || b.includes('alertas recientes') ||
             b.includes('centro de notificaciones')) {
    intent_type = 'notificaciones';
    confidence  = 0.75;

  // ── 8. PERFIL ────────────────────────────────────────────────────────────
  } else if (b.includes('mi perfil') || b.includes('perfil de usuario') ||
             b.includes('mis datos') || b.includes('mi cuenta') ||
             b.includes('datos personales') || b.includes('configuración') ||
             (b.includes('perfil') && b.includes('datos'))) {
    intent_type = 'perfil-usuario';
    confidence  = 0.75;

  // ── 9. EDICIÓN ───────────────────────────────────────────────────────────
  } else if (b.includes('editar') || b.includes('modificar') ||
             b.includes('actualizar') ||
             (b.includes('cambiar') && (b.includes('perfil') || b.includes('datos') || b.includes('cuenta')))) {
    intent_type = 'edicion-perfil';
    confidence  = 0.80;

  // ── 10. REGISTRO ─────────────────────────────────────────────────────────
  } else if (b.includes('registr') || b.includes('crear cuenta') ||
             b.includes('alta') || b.includes('sign up')) {
    intent_type = 'registro';
    confidence  = 0.80;

  // ── 11. FORMULARIO PRODUCTO — contratar sin contexto de visualización ────
  } else if ((b.includes('contratar') || b.includes('solicitar') ||
              b.includes('abrir cuenta') ||
              (b.includes('configurar') && b.includes('producto'))) &&
             !b.includes('muestra') && !b.includes('detalle') &&
             !b.includes('ver ') && !b.includes('mostrar') &&
             !b.includes('información') && !b.includes('visualiz')) {
    intent_type = 'formulario-producto';
    confidence  = 0.80;

  // ── 12. FORMULARIO GENÉRICO ──────────────────────────────────────────────
  } else if (b.includes('formulario') || b.includes('campo') ||
             b.includes('guardar datos')) {
    intent_type = 'formulario-default';
    confidence  = 0.65;

  // ── 13. DETALLE ──────────────────────────────────────────────────────────
  } else if (b.includes('detalle') || b.includes('ficha') ||
             b.includes('información de') || b.includes('ver más') ||
             b.includes('perfil de') || b.includes('valor liquidativo') ||
             b.includes('rentabilidad') ||
             (b.includes('muestra') && (b.includes('fondo') || b.includes('producto') || b.includes('transacci'))) ||
             (b.includes('muestra') && b.includes('fecha')) ||
             (b.includes('nombre del') && (b.includes('fondo') || b.includes('producto')))) {
    intent_type = 'detalle';
    confidence  = 0.80;

  // ── 14. LISTA — default para contenido navegable ─────────────────────────
  } else if (b.includes('lista') || b.includes('listado') ||
             b.includes('filtro') || b.includes('fondos') ||
             b.includes('transacciones') || b.includes('resultados') ||
             b.includes('ver mis') || b.includes('quiero ver')) {
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
