// core/navigationMaps.js
// Fuente de verdad ÚNICA para mapas de navegación e intent.
// Los mapas se inicializan desde globalRulesParser (lee global-rules/navigation.md).
// Si el parser falla, usa los valores hardcodeados como fallback seguro.

const { getNavLevel: _getNavLevel, getAllRules } = require('./globalRulesParser');

// ── Fallback hardcodeado — solo si globalRulesParser falla ───────────────────
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

// Mapa intent → patrón (estático — no cambia con reglas)
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
// Se construye lazy — primera vez que se necesita
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
    console.warn('  ⚠ [NavMaps] globalRulesParser no disponible — usando fallback');
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

module.exports = {
  INTENT_TO_LEVEL,
  INTENT_TO_PATTERN,
  MULTISCREEN_INTENTS,
  invalidateNavCache,
};
