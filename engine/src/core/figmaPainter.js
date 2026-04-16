// core/figmaPainter.js
// ─────────────────────────────────────────────────────────────────────────────
// FigmaPainter - Level 3.3
// Spacing gobernado por tokens: spacingRegistry.js + layoutRules.json
// Regla de oro: NUNCA hardcodear alturas ni gaps. Siempre leer del nodo real.
// ─────────────────────────────────────────────────────────────────────────────

// Cargar spacingRegistry con fallback robusto si el archivo no está disponible
let SPACING_BY_BREAKPOINT, REGISTRY_FROM_SPACING, PAINT_RULES, LAYOUT_RULES;
try {
  const sr = require('./spacingRegistry');
  SPACING_BY_BREAKPOINT  = sr.SPACING_BY_BREAKPOINT;
  REGISTRY_FROM_SPACING  = sr.COMPONENT_REGISTRY;
  PAINT_RULES            = sr.PAINT_RULES;
  LAYOUT_RULES           = require('./layoutRules.json');
  console.log('  ✓ [Painter] spacingRegistry + layoutRules cargados');
} catch(e) {
  console.warn('  ⚠ [Painter] spacingRegistry no disponible - usando fallback mobile');
  SPACING_BY_BREAKPOINT = {
    mobile: {
      screenWidth: 390, marginScreen: 16, paddingContent: 16,
      paddingTop: 12, paddingBottom: 16, gapSection: 8,
      gapItem: 0, gapInline: 8, safeZoneBottom: 34, safeZoneTop: 16,
      headerHeight: 56, bottomHeight: 90,
    }
  };
  REGISTRY_FROM_SPACING = {};
  PAINT_RULES = { zoneOrder: ['header','content','bottom'], fullWidthZones: ['header','bottom'], marginZones: ['content'] };
  LAYOUT_RULES = { breakpoints: { mobile: { screen: { width: 390, height: 844 } } } };
}

// Breakpoint activo - se puede cambiar vía env o parámetro en tiempo de ejecución
const ACTIVE_BREAKPOINT = process.env.DS_BREAKPOINT || 'mobile';

// ── Tokens de spacing resueltos para el breakpoint activo ─────────────────────
function getSpacing(breakpoint) {
  return SPACING_BY_BREAKPOINT[breakpoint] || SPACING_BY_BREAKPOINT.mobile;
}

function getLayout(breakpoint) {
  return LAYOUT_RULES.breakpoints[breakpoint] || LAYOUT_RULES.breakpoints.mobile;
}

// ── COMPONENT REGISTRY ────────────────────────────────────────────────────────
// Fusiona el registry de spacing (tokens) con el registry de painter (nodeIds, texts)
// El painter aporta: nodeId, texts, slot, sticky, group
// El spacingRegistry aporta: gapAfter, gapAfterToken, respectNativeHeight, resizeWidth

const PAINTER_META = {
  'navigation-header': {
    nodeId: '1:3',
    texts: { title: '6' },
    slot: 'header', sticky: 'top',
    fullWidth: true,
  },
  'filter-bar': {
    nodeId: '1:24',
    texts: {},
    slot: 'filter',
    fullWidth: true, group: 'system',
  },
  'notification-banner': {
    nodeId: '20:802',
    texts: { title: '805', body: '806' },
    slot: 'banner', repeatable: true,
    fullWidth: true, group: 'system',
  },
  'list-header': {
    nodeId: '20:797',
    texts: { label: '798', action: '799' },
    slot: 'section-header',
    fullWidth: true, group: 'section',
  },
  'card-item': {
    nodeId: '1:13',
    texts: { title: '15', subtitle: '16', value: '18' },
    slot: 'list-item', repeatable: true,
    fullWidth: true, group: 'list',
  },
  'card-item/financial': {
    nodeId: '137:1758',
    texts: { title: '?', subtitle: '?', value: '?' },
    slot: 'list-item', repeatable: true,
    fullWidth: true, group: 'list',
  },
  'card-item/financial-expense': {
    nodeId: '137:1769',
    texts: { title: '?', subtitle: '?', value: '?' },
    slot: 'list-item', repeatable: true,
    fullWidth: true, group: 'list',
  },
  'card-item/account': {
    nodeId: '185:3919',
    texts: { 'account-name': '?', balance: '?' },
    slot: 'list-item', repeatable: true,
    fullWidth: true, group: 'list',
  },
  'card-media': {
    nodeId: '217:2086',
    texts: { title: '?', category: '?', description: '?' },
    slot: 'media-card', repeatable: true,
    fullWidth: true, group: 'list',
  },
  'input-text': {
    nodeId: '1:21',
    texts: { label: '22', placeholder: '23' },
    slot: 'form-field', repeatable: true,
    withMargin: true, group: 'form',
  },
  'empty-state': {
    nodeId: '1:31',
    texts: { title: '33', description: '34', action: '35' },
    slot: 'empty', fullWidth: true,
  },
  'button-primary': {
    nodeId: '1:9',
    texts: { label: '10' },
    slot: 'cta', sticky: 'bottom',
    withMargin: true,
  },
  'button-secondary': {
    nodeId: '1:11',
    texts: { label: '12' },
    slot: 'cta-secondary', sticky: 'bottom',
    withMargin: true,
  },
  'modal-bottom-sheet': {
    nodeId: '1:36',
    texts: { title: '38', description: '39' },
    slot: 'modal', sticky: 'bottom',
    fullWidth: true,
  },
  'tab-bar': {
    nodeId: '20:784',
    texts: {},
    slot: 'tab-bar', sticky: 'bottom',
    fullWidth: true,
  },
  'badge': {
    nodeId: '20:800',
    texts: { label: '801' },
    slot: 'badge', withMargin: true,
  },
  'card-summary': {
    nodeId: '185:3909',
    texts: { amount: '?', 'account-label': '?', cta: '?' },
    slot: 'summary-card', withMargin: true, group: 'summary',
  },
  'amount-display': {
    nodeId: '179:3469',
    texts: {},
    slot: 'amount', withMargin: true,
  },
  'chart-sparkline': {
    nodeId: '137:1746',
    texts: {},
    slot: 'chart', withMargin: true,
  },
  'card-accounts': {
    nodeId: '307:1184',
    texts: { title: 'account-name', account_number: 'account-number', balance: 'balance' },
    slot: 'account-card', repeatable: true,
    withMargin: true, group: 'accounts',
    layout: 'grid-horizontal', gridCols: 2,
  },
  'movements-set': {
    nodeId: '307:1185',
    texts: { header_title: 'title', header_date: 'title' },
    slot: 'movements', repeatable: true,
    fullWidth: true, group: 'movements',
  },
  'skeleton-loader': {
    nodeId: '137:1752',
    texts: {},
    slot: 'list-item', repeatable: true,
    fullWidth: true, group: 'list',
  },
};

// Fusión de los dos registries - painter_meta gana en caso de conflicto de nodeId
function _getMeta(componentName) {
  const painter  = PAINTER_META[componentName];
  const spacing  = REGISTRY_FROM_SPACING[componentName];
  if (!painter) return null;
  return { ...spacing, ...painter }; // painter sobreescribe spacing donde hay colisión
}

// ── GAP SEMÁNTICO ─────────────────────────────────────────────────────────────
// Calcula el gap entre dos componentes según tokens del DS
function _getGapBetween(prevComp, nextComp, sp) {
  if (!prevComp) return 0;

  const prevMeta = _getMeta(prevComp.component);
  const nextMeta = _getMeta(nextComp.component);

  // Prioridad 1: gapAfter del componente anterior (viene de spacingRegistry)
  if (prevMeta?.gapAfter !== undefined) return prevMeta.gapAfter;

  // Prioridad 2: mismo grupo → gap mínimo (Gap/XS = 2px)
  if (prevMeta?.group && prevMeta.group === nextMeta?.group) return 2;

  // Prioridad 3: bloques distintos → Gap/MD
  return sp.gapSection;
}

// ── GENERADOR PRINCIPAL ───────────────────────────────────────────────────────
function generatePainterCode(composition, options = {}) {
  const { x = 0, y = 0, label = null, breakpoint = ACTIVE_BREAKPOINT } = options;
  const { pattern, components = [], confidence } = composition;

  if (!components || components.length === 0) {
    throw new Error('Composición sin componentes');
  }

  // Tokens de spacing y layout para el breakpoint activo
  const sp = getSpacing(breakpoint);
  const layout = getLayout(breakpoint);

  const SCREEN_W = sp.screenWidth || 390;
  const SCREEN_H = layout.screen.height || 844;
  const MARGIN   = sp.marginScreen;

  // Separar por zona
  const headerComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'top');
  const bottomComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'bottom');
  const contentComponents = components.filter(c => {
    const meta = _getMeta(c.component);
    return !meta?.sticky;
  });

  const screenName     = `gen_${Date.now()} - ${pattern} - ${Math.round((confidence?.global || 0) * 100)}%`;
  const confidenceLabel = label || `${pattern} | ${Math.round((confidence?.global || 0) * 100)}% | ${breakpoint}`;

  const lines = [];
  lines.push(`// FigmaPainter v3.3 - ${pattern} - ${breakpoint} - spacing from tokens`);
  lines.push(`// Breakpoint: ${breakpoint} | screenW: ${SCREEN_W} | margin: ${MARGIN}px | gapSection: ${sp.gapSection}px`);
  lines.push(`const PAGE_W = ${SCREEN_W};`);
  lines.push(`const PAGE_H = ${SCREEN_H};`);
  lines.push(`const MARGIN = ${MARGIN};`);
  lines.push(`const page = figma.currentPage;`);
  lines.push(``);

  // Frame principal
  lines.push(`// Frame principal`);
  lines.push(`const screen = figma.createFrame();`);
  lines.push(`screen.name = ${JSON.stringify(screenName)};`);
  lines.push(`screen.resize(PAGE_W, PAGE_H);`);
  lines.push(`screen.x = ${x};`);
  lines.push(`screen.y = ${y};`);
  lines.push(`screen.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];`);
  lines.push(`screen.clipsContent = true;`);
  lines.push(`page.appendChild(screen);`);
  lines.push(`let _y = 0; // acumulador de posición Y - se incrementa con altura REAL del nodo`);
  lines.push(``);

  // ── HEADER ────────────────────────────────────────────────────────────────
  if (headerComponents.length > 0) {
    lines.push(`// ── Header zone (fullWidth, sin margen) ─────────────────────`);
    for (const comp of headerComponents) {
      lines.push(..._generateBlock(comp, { breakpoint, SCREEN_W, MARGIN, yMode: 'var', sp }));
    }
    lines.push(``);
  }

  // ── CONTENT ───────────────────────────────────────────────────────────────
  if (contentComponents.length > 0) {
    lines.push(`// ── Content zone ────────────────────────────────────────────`);
    lines.push(`_y += ${sp.paddingTop}; // Padding/Vertical/MD - padding top del área de contenido`);
    lines.push(``);

    // Pre-procesar: agrupar componentes grid-horizontal consecutivos del mismo grupo
    const processedContent = [];
    let i = 0;
    while (i < contentComponents.length) {
      const comp = contentComponents[i];
      const meta = _getMeta(comp.component);
      if (meta?.layout === 'grid-horizontal') {
        // Recoger todos los consecutivos del mismo grupo
        const group = [comp];
        let j = i + 1;
        while (j < contentComponents.length) {
          const nextMeta = _getMeta(contentComponents[j].component);
          if (nextMeta?.layout === 'grid-horizontal' && nextMeta?.group === meta?.group) {
            group.push(contentComponents[j]);
            j++;
          } else break;
        }
        processedContent.push({ type: 'grid-group', items: group, meta });
        i = j;
      } else {
        processedContent.push({ type: 'single', comp });
        i++;
      }
    }

    for (let pi = 0; pi < processedContent.length; pi++) {
      const item = processedContent[pi];
      const prevComp = pi > 0
        ? (processedContent[pi-1].type === 'single' ? processedContent[pi-1].comp : processedContent[pi-1].items[0])
        : null;

      if (item.type === 'grid-group') {
        const { items, meta } = item;
        const gap = _getGapBetween(prevComp, items[0], sp);
        if (gap > 0) lines.push(`_y += \${gap}; // gap before grid group`);

        const cols   = meta.gridCols || 2;
        const totalW = SCREEN_W - (MARGIN * 2);
        const colW   = Math.floor((totalW - (cols - 1) * 8) / cols);
        const gridVar = `_grid_\${items[0].component.replace(/[^a-zA-Z0-9]/g,'_')}_\${pi}`;

        lines.push(`{ // grid-horizontal: \${items.map(c=>c.component).join(', ')}`);
        lines.push(`  const \${gridVar} = figma.createFrame();`);
        lines.push(`  \${gridVar}.name = 'grid-accounts';`);
        lines.push(`  \${gridVar}.layoutMode = 'HORIZONTAL';`);
        lines.push(`  \${gridVar}.itemSpacing = 8;`);
        lines.push(`  \${gridVar}.paddingLeft = 0; \${gridVar}.paddingRight = 0;`);
        lines.push(`  \${gridVar}.paddingTop = 0; \${gridVar}.paddingBottom = 0;`);
        lines.push(`  \${gridVar}.fills = [];`);
        lines.push(`  \${gridVar}.counterAxisSizingMode = 'AUTO';`);
        lines.push(`  \${gridVar}.primaryAxisSizingMode = 'FIXED';`);
        lines.push(`  \${gridVar}.resize(\${totalW}, 10);`);
        lines.push(`  \${gridVar}.x = \${MARGIN};`);
        lines.push(`  \${gridVar}.y = _y;`);

        for (let gi = 0; gi < items.length; gi++) {
          const gc = items[gi];
          const nodeId = (gc.node_id && gc.node_id !== 'pending') ? gc.node_id : meta.nodeId;
          const gv = `_gc_\${gi}_\${pi}`;
          lines.push(`  const _gsrc_\${gi} = await figma.getNodeByIdAsync('\${nodeId}');`);
          lines.push(`  if (_gsrc_\${gi}) {`);
          lines.push(`    const \${gv} = _gsrc_\${gi}.clone();`);
          lines.push(`    \${gv}.resize(\${colW}, \${gv}.height);`);
          lines.push(`    \${gridVar}.appendChild(\${gv});`);
          lines.push(`  }`);
        }

        lines.push(`  screen.appendChild(\${gridVar});`);
        lines.push(`  _y += \${gridVar}.height;`);
        lines.push(`}`);
        lines.push(``);

      } else {
        const { comp } = item;
        const gap = _getGapBetween(prevComp, comp, sp);
        if (gap > 0) {
          const gapToken = _getMeta(prevComp?.component)?.gapAfterToken || 'Gap/MD';
          lines.push(`_y += \${gap}; // \${gapToken}`);
        }
        lines.push(..._generateBlock(comp, { breakpoint, SCREEN_W, MARGIN, yMode: 'var', sp }));
        lines.push(``);
      }
    }
  }

  // ── BOTTOM ────────────────────────────────────────────────────────────────
  if (bottomComponents.length > 0) {
    lines.push(`// ── Bottom zone (sticky, sin margen) ───────────────────────`);
    const ORDER = ['modal-bottom-sheet', 'button-primary', 'button-secondary', 'tab-bar'];
    const sorted = [...bottomComponents].sort((a, b) =>
      (ORDER.indexOf(a.component) ?? 99) - (ORDER.indexOf(b.component) ?? 99)
    );

    let bottomOffset = SCREEN_H;
    for (const comp of [...sorted].reverse()) {
      const meta = _getMeta(comp.component);
      // Altura de referencia para cálculo de posición - se usa SOLO para calcular yFixed
      // El resize real respeta el nodo nativo
      const refH = REGISTRY_FROM_SPACING[comp.component]?.height || 56;
      bottomOffset -= refH;
      lines.push(..._generateBlock(comp, { breakpoint, SCREEN_W, MARGIN, yMode: 'fixed', yFixed: bottomOffset, sp }));
    }
    lines.push(``);
  }

  // Label
  lines.push(`// Label`);
  lines.push(`const _label = figma.createText();`);
  lines.push(`await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });`);
  lines.push(`_label.fontName = { family: 'Inter', style: 'Medium' };`);
  lines.push(`_label.fontSize = 11;`);
  lines.push(`_label.characters = ${JSON.stringify(confidenceLabel)};`);
  lines.push(`_label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];`);
  lines.push(`_label.x = ${x};`);
  lines.push(`_label.y = ${y} - 28;`);
  lines.push(`page.appendChild(_label);`);
  lines.push(``);
  lines.push(`figma.viewport.scrollAndZoomIntoView([screen]);`);
  lines.push(`return { screenId: screen.id, pattern: ${JSON.stringify(pattern)}, children: screen.children.length };`);

  return lines.join('\n');
}

// ── GENERADOR DE BLOQUE POR COMPONENTE ───────────────────────────────────────
// LA REGLA MÁS IMPORTANTE:
//   _y += nativeHeight  ← altura REAL del nodo clonado, nunca del HEIGHT_MAP
//   resize solo en X    ← nunca forzar Y si respectNativeHeight = true
function _generateBlock(comp, { SCREEN_W, MARGIN, yMode, yFixed, sp }) {
  const meta = _getMeta(comp.component);
  if (!meta) return [`// WARN: componente no encontrado en registry: ${comp.component}`];

  const nodeId   = (comp.node_id && comp.node_id !== 'pending') ? comp.node_id : meta.nodeId;
  const isFullW  = meta.fullWidth;
  const hasMargin = meta.withMargin;

  // Ancho: fullWidth = screenWidth, withMargin = screenWidth - margin*2
  const marginH  = isFullW ? 0 : (hasMargin ? MARGIN : 0);
  const w        = SCREEN_W - (marginH * 2);
  const xPos     = marginH;

  const suffix  = comp._index !== undefined ? `_${comp._index}` : '';
  const varName = `_${comp.component.replace(/[^a-zA-Z0-9]/g, '_')}${suffix}`;

  const lines = [];
  lines.push(`{ // ${comp.component}`);
  lines.push(`  const _src = await figma.getNodeByIdAsync('${nodeId}');`);
  lines.push(`  if (!_src) { console.warn('[Painter] Node not found: ${nodeId} (${comp.component})'); }`);
  lines.push(`  else {`);
  lines.push(`    // createInstance() mantiene vínculo al maestro — respeta tokens y tipografías del DS`);
  lines.push(`    let ${varName};`);
  lines.push(`    if (_src.type === 'COMPONENT_SET') {`);
  lines.push(`      const _dv = _src.defaultVariant || _src.children[0];`);
  lines.push(`      ${varName} = _dv ? _dv.createInstance() : _src.clone();`);
  lines.push(`    } else if (_src.type === 'COMPONENT') {`);
  lines.push(`      ${varName} = _src.createInstance();`);
  lines.push(`    } else {`);
  lines.push(`      ${varName} = _src.clone();`);
  lines.push(`    }`);
  lines.push(`    ${varName}.x = ${xPos};`);

  if (yMode === 'fixed') {
    lines.push(`    ${varName}.y = ${yFixed};`);
  } else {
    // yMode === 'var' - acumular con altura REAL del nodo
    lines.push(`    ${varName}.y = _y;`);
    // ── CAMBIO CLAVE: _y += nativeHeight, no HEIGHT_MAP ──
    lines.push(`    const _nativeH_${varName} = ${varName}.height; // altura real del componente Figma`);
    lines.push(`    _y += _nativeH_${varName}; // acumulamos con altura nativa - nunca hardcodeada`);
  }

  // ── GRID HORIZONTAL: componentes en fila (ej: card-accounts 2×1) ─────────
  // Si layout === 'grid-horizontal', se agrupa con el siguiente componente del mismo grupo
  // El painter genera un frame contenedor horizontal y coloca las instancias dentro
  // Este bloque se resuelve en generatePainterCode — aquí solo aplicamos el ancho correcto
  if (meta.layout === 'grid-horizontal' && meta.gridCols) {
    const colW = Math.floor((w - (meta.gridCols - 1) * 8) / meta.gridCols);
    lines.push(`    // grid-horizontal: ancho de columna = ${SCREEN_W - (marginH * 2)} / ${meta.gridCols} cols`);
    lines.push(`    if (${varName}.type === 'INSTANCE' || ${varName}.type === 'FRAME') {`);
    lines.push(`      ${varName}.resize(${colW}, ${varName}.height);`);
    lines.push(`    }`);
  } else if (meta.respectNativeHeight !== false) {
    // Resize SOLO en X - nunca forzar la altura
    lines.push(`    // Resize solo ancho - altura nativa respetada (respectNativeHeight: true)`);
    lines.push(`    if (${varName}.type === 'INSTANCE' || ${varName}.type === 'FRAME') {`);
    lines.push(`      ${varName}.resize(${w}, ${varName}.height);`);
    lines.push(`    }`);
  } else {
    // Los pocos componentes con altura fija conocida
    const refH = REGISTRY_FROM_SPACING[comp.component]?.height || 56;
    lines.push(`    ${varName}.resize(${w}, ${refH});`);
  }

  lines.push(`    screen.appendChild(${varName});`);

  // Aplicar props de texto
  if (comp.props && meta.texts) {
    for (const [slot] of Object.entries(meta.texts)) {
      const propValue = comp.props[slot];
      if (propValue) {
        lines.push(`    {`);
        lines.push(`      const _t = ${varName}.findOne(n => n.type === 'TEXT' && n.name === '${slot}');`);
        lines.push(`      if (_t) { await figma.loadFontAsync(_t.fontName); _t.characters = ${JSON.stringify(String(propValue))}; }`);
        lines.push(`    }`);
      }
    }
  }

  lines.push(`  }`);
  lines.push(`}`);
  return lines;
}

// ── API PÚBLICA ───────────────────────────────────────────────────────────────

function paint(composition, options = {}) {
  return generatePainterCode(composition, options);
}

function getRegistry() {
  return PAINTER_META;
}

module.exports = { paint, getRegistry, PAINTER_META, COMPONENT_REGISTRY: PAINTER_META };

