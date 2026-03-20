// core/figmaPainter.js
// ─────────────────────────────────────────────────────────────────────────────
// FigmaPainter — Level 3.2
// Mejoras de spacing:
//   - PADDING_H diferenciado por tipo de componente (edge-to-edge vs inset)
//   - GAP entre componentes basado en relación semántica (mismo grupo = 0, sección = 16, bloque = 24)
//   - Márgenes laterales reales: 16px para contenido, 0px para componentes de sistema
//   - Padding top/bottom dentro del área de contenido
//   - Separadores visuales entre secciones (list-header → cards)
// ─────────────────────────────────────────────────────────────────────────────

// ── TOKENS DE SPACING ─────────────────────────────────────────────────────────
// Basados en tokens.css del Simple DS
const SPACING = {
  // Gaps entre componentes según relación
  GAP_NONE:        0,   // mismo componente repetido (cards consecutivas)
  GAP_TIGHT:       1,   // separador visual mínimo dentro de un grupo
  GAP_SECTION:    16,   // entre sección y su contenido (list-header → cards)
  GAP_BLOCK:      24,   // entre bloques distintos (filter → cards, banner → cards)
  GAP_LARGE:      32,   // entre áreas principales (header → primer contenido)

  // Márgenes horizontales por tipo
  MARGIN_EDGE:     0,   // componentes full-width del sistema (header, filter, tab-bar, banner)
  MARGIN_CONTENT: 16,   // contenido con margen lateral (cards, inputs, buttons, empty-state)
  MARGIN_INSET:   24,   // contenido más aireado (modales sueltos, estados de error)

  // Padding vertical del área de contenido
  CONTENT_PADDING_TOP:    12,
  CONTENT_PADDING_BOTTOM: 24,
};

// ── COMPONENT REGISTRY ────────────────────────────────────────────────────────
// marginH: margen lateral real del componente
// gapAfter: gap que deja este componente ANTES del siguiente (gap semántico)
// gapBefore: gap extra ANTES de este componente (cuando viene después de otro tipo)
// group: agrupa componentes que van juntos sin separación extra

const COMPONENT_REGISTRY = {
  'navigation-header': {
    nodeId: '1:3', height: 56, width: 390,
    texts: { title: '6' },
    slot: 'header',
    sticky: 'top',
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: 0,          // el header no deja gap — el contenido empieza justo
  },
  'filter-bar': {
    nodeId: '1:24', height: 48, width: 390,
    texts: {},
    slot: 'filter',
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_BLOCK,   // después del filter hay un bloque de contenido
    group: 'system',
  },
  'notification-banner': {
    nodeId: '20:802', height: 64, width: 390,
    texts: { title: '805', body: '806' },
    slot: 'banner',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_BLOCK,
    group: 'system',
  },
  'list-header': {
    nodeId: '20:797', height: 44, width: 390,
    texts: { label: '798', action: '799' },
    slot: 'section-header',
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_NONE,    // el list-header va pegado a sus cards
    gapBefore: SPACING.GAP_BLOCK,  // pero sí se separa del bloque anterior
    group: 'section',
  },
  'card-item': {
    nodeId: '1:13', height: 72, width: 390,
    texts: { title: '15', subtitle: '16', value: '18' },
    slot: 'list-item',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,  // cards van edge-to-edge en listas
    gapAfter: SPACING.GAP_TIGHT,   // separador mínimo entre cards (1px)
    group: 'list',
  },
  'input-text': {
    nodeId: '1:21', height: 56, width: 390,
    texts: { label: '22', placeholder: '23' },
    slot: 'form-field',
    repeatable: true,
    marginH: SPACING.MARGIN_CONTENT,   // inputs con margen lateral
    gapAfter: SPACING.GAP_SECTION,     // entre campos hay espacio para respirar
    group: 'form',
  },
  'empty-state': {
    nodeId: '1:31', height: 244, width: 390,
    texts: { title: '33', description: '34', action: '35' },
    slot: 'empty',
    centered: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_BLOCK,
    gapBefore: SPACING.GAP_BLOCK,
  },
  'button-primary': {
    nodeId: '1:9', height: 52, width: 390,
    texts: { label: '10' },
    slot: 'cta',
    fullWidth: true,
    marginH: SPACING.MARGIN_CONTENT,   // botones con margen lateral
    gapAfter: SPACING.GAP_SECTION,
    gapBefore: SPACING.GAP_BLOCK,
    sticky: 'bottom',
  },
  'button-secondary': {
    nodeId: '1:11', height: 52, width: 390,
    texts: { label: '12' },
    slot: 'cta-secondary',
    fullWidth: true,
    marginH: SPACING.MARGIN_CONTENT,
    gapAfter: SPACING.GAP_SECTION,
    sticky: 'bottom',
  },
  'modal-bottom-sheet': {
    nodeId: '1:36', height: 280, width: 390,
    texts: { title: '38', description: '39' },
    slot: 'modal',
    sticky: 'bottom',
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: 0,
  },
  'tab-bar': {
    nodeId: '20:784', height: 56, width: 390,
    texts: {},
    slot: 'tab-bar',
    sticky: 'bottom',
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: 0,
  },
  'badge': {
    nodeId: '20:800', height: 26, width: 72,
    texts: { label: '801' },
    slot: 'badge',
    marginH: SPACING.MARGIN_CONTENT,
    gapAfter: SPACING.GAP_TIGHT,
  },
  'card-summary': {
    nodeId: '185:3909', height: 120, width: 390,
    texts: { amount: '?', 'account-label': '?', variation: '?', 'updated-at': '?', cta: '?' },
    slot: 'summary-card',
    repeatable: false,
    marginH: SPACING.MARGIN_CONTENT,
    gapAfter: SPACING.GAP_BLOCK,
    group: 'summary',
  },
  'card-item/account': {
    nodeId: '185:3919', height: 72, width: 390,
    texts: { 'account-name': '?', 'account-number': '?', balance: '?', 'account-type': '?' },
    slot: 'list-item',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_TIGHT,
    group: 'list',
  },
  'amount-display': {
    nodeId: '137:1740', height: 126, width: 390,
    texts: {},
    slot: 'amount',
    marginH: SPACING.MARGIN_CONTENT,
    gapAfter: SPACING.GAP_BLOCK,
  },
  'chart-sparkline': {
    nodeId: '137:1746', height: 80, width: 390,
    texts: {},
    slot: 'chart',
    marginH: SPACING.MARGIN_CONTENT,
    gapAfter: SPACING.GAP_BLOCK,
  },
  'skeleton-loader': {
    nodeId: '137:1752', height: 72, width: 390,
    texts: {},
    slot: 'list-item',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_TIGHT,
  },
  'card-item/financial': {
    nodeId: '137:1758', height: 72, width: 390,
    texts: { title: '?', subtitle: '?', value: '?' },
    slot: 'list-item',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_TIGHT,
    group: 'list',
  },
  'card-item/financial-expense': {
    nodeId: '137:1769', height: 72, width: 390,
    texts: { title: '?', subtitle: '?', value: '?' },
    slot: 'list-item',
    repeatable: true,
    marginH: SPACING.MARGIN_EDGE,
    gapAfter: SPACING.GAP_TIGHT,
    group: 'list',
  },
};

const SCREEN_W = 390;
const SCREEN_H = 844;

// ── LÓGICA DE GAP SEMÁNTICO ───────────────────────────────────────────────────
// Calcula el gap correcto entre dos componentes consecutivos según su relación
function _getGapBetween(prevComp, nextComp) {
  if (!prevComp) return 0;

  const prevMeta = COMPONENT_REGISTRY[prevComp.component];
  const nextMeta = COMPONENT_REGISTRY[nextComp.component];

  // Si el siguiente tiene gapBefore explícito, úsalo
  if (nextMeta?.gapBefore !== undefined) return nextMeta.gapBefore;

  // Si el anterior tiene gapAfter explícito, úsalo
  if (prevMeta?.gapAfter !== undefined) return prevMeta.gapAfter;

  // Mismo grupo → gap mínimo
  if (prevMeta?.group && prevMeta.group === nextMeta?.group) return SPACING.GAP_TIGHT;

  // Diferente tipo → gap de bloque
  return SPACING.GAP_BLOCK;
}

// ── GENERADOR PRINCIPAL ───────────────────────────────────────────────────────
function generatePainterCode(composition, options = {}) {
  const { x = 0, y = 0, label = null } = options;
  const { pattern, components = [], confidence } = composition;

  if (!components || components.length === 0) {
    throw new Error('Composición sin componentes');
  }

  // Separar por zona
  const headerComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'top');
  const bottomComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'bottom');
  const contentComponents = components.filter(c => {
    const meta = _getMeta(c.component);
    return !meta?.sticky;
  });

  const headerHeight = headerComponents.reduce((sum, c) => sum + _getHeight(c), 0);
  const bottomHeight = bottomComponents.reduce((sum, c) => sum + _getHeight(c), 0);

  const screenName = `gen_${Date.now()} — ${pattern} — ${Math.round((confidence?.global || 0) * 100)}%`;
  const confidenceLabel = label || `☁️ Railway → ${pattern} | confidence: ${Math.round((confidence?.global || 0) * 100)}%`;

  const lines = [];
  lines.push(`// FigmaPainter v3.2 — ${pattern} — spacing system`);
  lines.push(`const PAGE_W = ${SCREEN_W};`);
  lines.push(`const PAGE_H = ${SCREEN_H};`);
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
  lines.push(`let _y = 0;`);
  lines.push(``);

  // ── Header (sticky top) ──────────────────────────────────────────────────
  if (headerComponents.length > 0) {
    lines.push(`// ── Header ────────────────────────────────────`);
    for (const comp of headerComponents) {
      lines.push(..._generateComponentBlock(comp, { yFromVar: true }));
    }
    lines.push(``);
  }

  // ── Content ──────────────────────────────────────────────────────────────
  if (contentComponents.length > 0) {
    lines.push(`// ── Content ───────────────────────────────────`);
    lines.push(`_y += ${SPACING.CONTENT_PADDING_TOP}; // padding top del área de contenido`);
    lines.push(``);

    for (let i = 0; i < contentComponents.length; i++) {
      const comp = contentComponents[i];
      const prevComp = i > 0 ? contentComponents[i - 1] : null;
      const gap = _getGapBetween(prevComp, comp);

      if (gap > 0) {
        lines.push(`_y += ${gap}; // gap semántico antes de ${comp.component}`);
      }

      lines.push(..._generateComponentBlock(comp, { yFromVar: true }));
      lines.push(``);
    }
  }

  // ── Bottom (sticky bottom) ───────────────────────────────────────────────
  if (bottomComponents.length > 0) {
    lines.push(`// ── Bottom (sticky) ──────────────────────────`);

    // Ordenar: modal primero (más alto), luego buttons, luego tab-bar
    const ORDER = ['modal-bottom-sheet', 'button-primary', 'button-secondary', 'tab-bar'];
    const sorted = [...bottomComponents].sort((a, b) => {
      return (ORDER.indexOf(a.component) ?? 99) - (ORDER.indexOf(b.component) ?? 99);
    });

    let bottomOffset = SCREEN_H;
    for (const comp of [...sorted].reverse()) {
      const h = _getHeight(comp);
      const meta = _getMeta(comp.component);
      const marginH = meta?.marginH ?? 0;
      bottomOffset -= h;

      // Padding bottom para botones (no para tab-bar ni modal)
      const paddingBottom = comp.component === 'tab-bar' ? 0
        : comp.component === 'modal-bottom-sheet' ? 0
        : SPACING.CONTENT_PADDING_BOTTOM;

      lines.push(..._generateComponentBlock(comp, {
        yFixed: bottomOffset - paddingBottom,
        marginH,
      }));
    }
    lines.push(``);
  }

  // Label encima del frame
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

// ── HELPERS ───────────────────────────────────────────────────────────────────

function _getMeta(componentName) {
  return COMPONENT_REGISTRY[componentName] || null;
}

function _getHeight(comp) {
  const meta = _getMeta(comp.component);
  return meta?.height || 56;
}

function _generateComponentBlock(comp, opts = {}) {
  const { yFromVar = false, yFixed = null, marginH: overrideMarginH } = opts;
  const meta = _getMeta(comp.component);
  if (!meta) return [`// WARN: componente no encontrado: ${comp.component}`];

  const nodeId = comp.node_id && comp.node_id !== 'pending' ? comp.node_id : meta.nodeId;
  const h = meta.height;

  // Margen lateral: usa override si se pasa, sino el del registry
  const marginH = overrideMarginH !== undefined ? overrideMarginH : (meta.marginH ?? 0);
  const w = SCREEN_W - (marginH * 2);
  const xPos = marginH;

  const suffix = comp._index !== undefined ? `_${comp._index}` : '';
  const varName = `_${comp.component.replace(/-/g, '_')}${suffix}`;

  const lines = [];
  lines.push(`{`);
  lines.push(`  const _src = await figma.getNodeByIdAsync('${nodeId}');`);
  lines.push(`  if (!_src) { console.warn('Node not found: ${nodeId} (${comp.component})'); }`);
  lines.push(`  else {`);
  lines.push(`    const ${varName} = _src.clone();`);
  lines.push(`    ${varName}.x = ${xPos};`);

  if (yFixed !== null) {
    lines.push(`    ${varName}.y = ${yFixed};`);
  } else if (yFromVar) {
    lines.push(`    ${varName}.y = _y;`);
    lines.push(`    _y += ${h};`);
  }

  lines.push(`    ${varName}.resize(${w}, ${h});`);

  // Corner radius para componentes de contenido con margen
  if (marginH > 0 && comp.component !== 'button-primary' && comp.component !== 'button-secondary') {
    lines.push(`    if ('cornerRadius' in ${varName}) ${varName}.cornerRadius = 12;`);
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
  return COMPONENT_REGISTRY;
}

module.exports = { paint, getRegistry, COMPONENT_REGISTRY };
