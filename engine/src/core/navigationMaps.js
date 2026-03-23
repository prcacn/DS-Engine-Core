// core/navigationMaps.js
// Fuente de verdad única para mapas de navegación e intent.
// INTENT_TO_LEVEL está aquí — no en generate.js ni en intentParser.js.
// Referencia canónica: engine/global-rules/navigation.md

// Nivel de navegación por intent_type
// Fuente: engine/global-rules/navigation.md
const INTENT_TO_LEVEL = {
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
  'transferencia-bancaria': 'L2',
  'confirmacion':           'L3',
  'error-estado':           'L3',
};

// Mapa intent → patrón de pantalla
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
  'transferencia-bancaria': 'transferencia-bancaria',
};

// Intents que generan múltiples pantallas
const MULTISCREEN_INTENTS = ['transferencia-bancaria'];

module.exports = { INTENT_TO_LEVEL, INTENT_TO_PATTERN, MULTISCREEN_INTENTS };
