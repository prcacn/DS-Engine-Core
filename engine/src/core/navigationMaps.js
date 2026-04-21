// core/navigationMaps.js
// Fuente de verdad ÚNICA para mapas de navegación e intent.
// Los mapas se inicializan desde globalRulesParser (lee global-rules/navigation.md).
// Si el parser falla, usa los valores hardcodeados como fallback seguro.

const { getNavLevel: _getNavLevel, getAllRules } = require('./globalRulesParser');

// ── Fallback hardcodeado - solo si globalRulesParser falla ───────────────────
const _FALLBACK_LEVEL = {
  'dashboard':              'L0',
  'onboarding':             'L0',
  'lista-con-filtros':      'L1',
  'notificaciones':         'L1',
  'perfil-usuario':         'L1',
  'detalle':                'L2',
  'login':                  'L2',
  'registro':               'L2',
  'edicion-perfil':         'L2',
  'formulario-producto':    'L2',
  'formulario-default':     'L2',
  'lista-noticias':             'L1',
  'transferencia-bancaria': 'L2',
  'confirmacion':           'L3',
  'error-estado':           'L3',
};

// Mapa intent → patrón (estático - no cambia con reglas)
const INTENT_TO_PATTERN = {
  'dashboard':              'dashboard',
  'lista-con-filtros':      'lista-con-filtros',
  'login':                  'login',
  'registro':               'registro',
  'edicion-perfil':         'edicion-perfil',
  'formulario-producto':    'formulario-producto',
  'formulario-default':     'formulario-default',
  'confirmacion':           'confirmacion',
  'detalle':                'detalle',
  'onboarding':             'onboarding',
  'perfil-usuario':         'perfil-usuario',
  'error-estado':           'error-estado',
  'notificaciones':         'notificaciones',
  'lista-noticias':        'lista-noticias',
  'transferencia-bancaria': 'transferencia-bancaria',
};

const MULTISCREEN_INTENTS = ['transferencia-bancaria'];

// ── INTENT_TO_LEVEL: construido desde globalRulesParser ──────────────────────
// Se construye lazy - primera vez que se necesita
let _cachedLevelMap = null;

function getIntentToLevel() {
  if (_cachedLevelMap) return _cachedLevelMap;

  try {
    const rules = getAllRules();
    if (rules.navigation && rules.navigation.intentToLevel &&
        Object.keys(rules.navigation.intentToLevel).length > 0) {
      _cachedLevelMap = rules.navigation.intentToLevel;
      console.log('  ✓ [NavMaps] INTENT_TO_LEVEL cargado desde global-rules/navigation.md');
      return _cachedLevelMap;
    }
  } catch (err) {
    console.warn('  ⚠ [NavMaps] globalRulesParser no disponible - usando fallback');
  }

  _cachedLevelMap = _FALLBACK_LEVEL;
  return _cachedLevelMap;
}

// Proxy que siempre usa la fuente correcta
const INTENT_TO_LEVEL = new Proxy({}, {
  get(_, intent) {
    return getIntentToLevel()[intent];
  },
  has(_, intent) {
    return intent in getIntentToLevel();
  },
  ownKeys() {
    return Object.keys(getIntentToLevel());
  },
  getOwnPropertyDescriptor(_, key) {
    const map = getIntentToLevel();
    if (key in map) return { value: map[key], writable: false, enumerable: true, configurable: true };
  }
});

// Invalidar cache cuando el parser recarga sus reglas
function invalidateNavCache() {
  _cachedLevelMap = null;
}

// ── INFERIR NIVEL DE NAVEGACIÓN DESDE EL BRIEF ──────────────────────────────
// Refina el nivel de 'lista-con-filtros' y 'detalle' según contexto del brief.
// L0 = pantalla raíz (dashboard, tab activo)
// L1 = listado principal navegable desde el tab-bar
// L2 = sublista o detalle accesible desde L1 (con back button)
// L3 = confirmación, modal, resultado final
function inferNavLevelFromBrief(intentType, brief) {
  const b = (brief || '').toLowerCase();
  const baseLevel = getIntentToLevel()[intentType] || 'L1';

  // lista-con-filtros: puede ser L1 (listado raíz) o L2 (sublista de categoría)
  if (intentType === 'lista-con-filtros') {
    // Señales de L2: el listado es de un subdominio específico, no una raíz
    const l2signals = [
      'de contenido', 'de fondos', 'de transacciones recientes',
      'de una categoría', 'de noticias', 'de artículos',
      'filtros con', 'filtrado', 'subfondo', 'sublistado',
    ];
    if (l2signals.some(s => b.includes(s))) return 'L2';
    return 'L1'; // default para lista-con-filtros
  }

  // formulario-default: siempre L2 (accesible desde acción en L1)
  if (intentType === 'formulario-default') return 'L2';

  return baseLevel;
}

module.exports = {
  INTENT_TO_LEVEL,
  INTENT_TO_PATTERN,
  MULTISCREEN_INTENTS,
  invalidateNavCache,
  inferNavLevelFromBrief,
};

