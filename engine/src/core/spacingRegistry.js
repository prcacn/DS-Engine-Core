/**
 * spacingRegistry.js
 * Fuente única de verdad para spacing y layout de componentes.
 * El plugin lee este archivo al pintar pantallas - nunca hardcodea valores.
 *
 * Regla de oro:
 *   - respectNativeHeight: true  → NO hacer .resize en Y, respetar el alto del componente Figma
 *   - respectNativeHeight: false → el componente tiene altura fija conocida (raro)
 *   - gapAfter: N               → espacio entre este componente y el siguiente (token Gap/*)
 *   - paddingH: N               → margen horizontal que se aplica al x del componente
 */

// ─── TABLA DE TOKENS POR BREAKPOINT ──────────────────────────────────────────
// Leer desde layoutRules.json en runtime. Estos son los valores mobile por defecto.

const BREAKPOINT = process.env.DS_BREAKPOINT || 'mobile';

const SPACING_BY_BREAKPOINT = {
  mobile: {
    screenWidth:    390,
    marginScreen:   16,   // Padding/Horizontal/MD
    paddingContent: 16,   // Padding/Horizontal/MD
    paddingTop:     12,   // Padding/Vertical/MD
    paddingBottom:  16,   // Padding/Horizontal/MD
    gapSection:     8,    // Gap/MD
    gapItem:        4,    // Gap/SM  - entre items de lista consecutivos
    gapInline:      8,    // Gap/MD  - entre elementos dentro de un componente
    safeZoneBottom: 34,
    safeZoneTop:    16,
    headerHeight:   56,
    bottomHeight:   90,   // tab-bar 56 + safe 34
  },
  tablet: {
    screenWidth:    768,
    marginScreen:   24,   // Padding/Horizontal/LG
    paddingContent: 20,
    paddingTop:     16,
    paddingBottom:  20,
    gapSection:     12,
    gapItem:        4,
    gapInline:      12,
    safeZoneBottom: 20,
    safeZoneTop:    24,
    headerHeight:   64,
    bottomHeight:   76,
  },
  desktop: {
    screenWidth:    1440,
    marginScreen:   40,   // Padding/Horizontal/LG
    paddingContent: 24,
    paddingTop:     20,
    paddingBottom:  24,
    gapSection:     16,
    gapItem:        0,    // en desktop los items van a full sin gap
    gapInline:      16,
    safeZoneBottom: 0,
    safeZoneTop:    0,
    headerHeight:   64,
    bottomHeight:   56,
  },
  'card-accounts': {
    nodeId:              '307:1164',
    height:              237,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           false,
  },

};

// ─── REGISTRY DE COMPONENTES ──────────────────────────────────────────────────
// Por cada componente:
//   nodeId              → ID del nodo en Figma (Component o ComponentSet)
//   height              → alto de referencia (px) - solo para cálculo de pantalla
//   respectNativeHeight → true = NO tocar el Y resize, dejar que Figma lo maneje
//   resizeWidth         → true = ajustar ancho a screenWidth - paddingH*2
//   gapAfter            → gap tras el componente (en px, modo mobile)
//   gapAfterToken       → nombre del token DS correspondiente al gap
//   zone                → 'header' | 'content' | 'bottom' | 'overlay'
//   singleton           → true = máximo 1 por pantalla

const COMPONENT_REGISTRY = {

  'navigation-header': {
    nodeId:              '1:3',
    height:              56,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'header',
    singleton:           true,
  },

  'tab-bar': {
    nodeId:              '185:3900',
    height:              56,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'bottom',
    singleton:           true,
  },

  'card-item': {
    nodeId:              '185:3895',
    height:              72,
    respectNativeHeight: true,   // tiene auto-layout - nunca forzar altura
    resizeWidth:         true,
    gapAfter:            0,      // Gap/XS = 0 entre cards consecutivas (flush)
    gapAfterToken:       'Gap/XS',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'card-item/financial': {
    nodeId:              '185:3904',
    height:              72,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       'Gap/XS',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'card-media': {
    nodeId:              '217:2086',
    height:              290,    // variante vertical
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,      // Gap/MD entre cards de contenido
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'filter-bar': {
    nodeId:              '185:3897',
    height:              48,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'content',
    singleton:           true,
  },

  'input-text': {
    nodeId:              '185:3896',
    height:              52,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            12,     // Gap/LG entre inputs en formulario
    gapAfterToken:       'Gap/LG',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'button-primary': {
    nodeId:              '185:3893',
    height:              52,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,      // Gap/MD entre botones
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           true,
  },

  'button-secondary': {
    nodeId:              '185:3894',
    height:              52,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           true,
  },

  'empty-state': {
    nodeId:              '185:3898',
    height:              236,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'content',
    singleton:           true,
  },

  'modal-bottom-sheet': {
    nodeId:              '185:3899',
    height:              300,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'overlay',
    singleton:           true,
  },

  'list-header': {
    nodeId:              '185:3901',
    height:              44,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       null,
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'notification-banner': {
    nodeId:              '185:3903',
    height:              64,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            4,
    gapAfterToken:       'Gap/SM',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'amount-display': {
    nodeId:              '185:3906',
    height:              80,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            16,
    gapAfterToken:       'Gap/XL',
    zone:                'content',
    singleton:           true,
  },

  'card-summary': {
    nodeId:              '185:3918',
    height:              120,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'skeleton-loader': {
    nodeId:              '185:3908',
    height:              72,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            0,
    gapAfterToken:       'Gap/XS',
    zone:                'content',
    singleton:           false,
    repeatable:          true,
  },

  'chart-sparkline': {
    nodeId:              '137:1746',
    height:              80,
    respectNativeHeight: true,
    resizeWidth:         true,
    gapAfter:            8,
    gapAfterToken:       'Gap/MD',
    zone:                'content',
    singleton:           true,
  },

  // [COMPONENT_REGISTRY_END]
};

// ─── LÓGICA DE PAINT - REGLAS DE POSICIONAMIENTO ─────────────────────────────
/**
 * Cómo el plugin debe calcular _y al pintar componentes:
 *
 * 1. Ordenar componentes por zona: header → content → overlay → bottom
 * 2. Para cada componente en 'content':
 *    a. Clonar nodo Figma: const clone = sourceNode.clone()
 *    b. Posición X:  clone.x = spacing.marginScreen  (si resizeWidth)
 *    c. Ancho:       clone.resize(screenWidth - marginScreen*2, clone.height)
 *                    ← NUNCA tocar clone.height si respectNativeHeight = true
 *    d. Posición Y:  clone.y = _y  (acumulado)
 *    e. Acumular:    _y += clone.height + gapAfter
 * 3. 'header' siempre en y=0, ancho=screenWidth (sin margen)
 * 4. 'bottom'  siempre en y=screenHeight - bottomHeight, ancho=screenWidth
 * 5. 'overlay' se pinta encima del frame, no afecta _y
 *
 * NUNCA usar HEIGHT_MAP hardcodeado. SIEMPRE leer clone.height tras el clone.
 */

const PAINT_RULES = {
  zoneOrder:     ['header', 'content', 'bottom'],
  overlayZones:  ['overlay'],

  // Zonas que van a ancho completo (sin margen)
  fullWidthZones: ['header', 'bottom'],

  // Zonas que respetan el margen de pantalla
  marginZones:   ['content'],

  // Gap entre zonas distintas (header→content, content→bottom)
  gapBetweenZones: 0,  // las zonas se tocan sin gap
};

module.exports = {
  SPACING_BY_BREAKPOINT,
  COMPONENT_REGISTRY,
  PAINT_RULES,
  getSpacing: (breakpoint = 'mobile') => SPACING_BY_BREAKPOINT[breakpoint] || SPACING_BY_BREAKPOINT.mobile,
  getComponent: (name) => COMPONENT_REGISTRY[name] || null,
};
