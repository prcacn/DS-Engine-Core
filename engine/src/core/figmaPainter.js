// core/figmaPainter.js
// ─────────────────────────────────────────────────────────────────────────────
// FigmaPainter — Level 3.1
// Motor genérico de pintado: recibe una composición del engine y genera
// el código JavaScript listo para ejecutar en figma_execute / Figma plugin.
//
// NO depende de ningún patrón específico — consume el JSON de /generate
// y construye la pantalla dinámicamente según los componentes y sus contratos.
// ─────────────────────────────────────────────────────────────────────────────

// Mapa de componentes del DS con sus alturas reales y text nodes
// Source of truth: auditado directamente desde Figma (Simple DS)
const COMPONENT_REGISTRY = {
  'navigation-header': {
    nodeId: '1:3', height: 56, width: 390,
    texts: { title: '6' },
    slot: 'header',       // siempre va arriba
    sticky: 'top'
  },
  'button-primary': {
    nodeId: '1:9', height: 48, width: 390,
    texts: { label: '10' },
    slot: 'cta',
    fullWidth: true
  },
  'button-secondary': {
    nodeId: '1:11', height: 48, width: 390,
    texts: { label: '12' },
    slot: 'cta-secondary',
    fullWidth: true
  },
  'card-item': {
    nodeId: '1:13', height: 72, width: 390,
    texts: { title: '15', subtitle: '16', value: '18' },
    slot: 'list-item',
    repeatable: true
  },
  'input-text': {
    nodeId: '1:21', height: 50, width: 390,
    texts: { label: '22', placeholder: '23' },
    slot: 'form-field',
    repeatable: true,
    paddingH: 16        // necesita margen horizontal
  },
  'filter-bar': {
    nodeId: '1:24', height: 48, width: 390,
    texts: {},          // chips internos, no editables individualmente
    slot: 'filter'
  },
  'empty-state': {
    nodeId: '1:31', height: 244, width: 390,
    texts: { title: '33', description: '34', action: '35' },
    slot: 'empty',
    centered: true
  },
  'modal-bottom-sheet': {
    nodeId: '1:36', height: 255, width: 390,
    texts: { title: '38', description: '39' },
    slot: 'modal',
    sticky: 'bottom'
  },
  'tab-bar': {
    nodeId: '20:784', height: 56, width: 390,
    texts: {},
    slot: 'tab-bar',
    sticky: 'bottom'    // SIEMPRE va al fondo
  },
  'list-header': {
    nodeId: '20:797', height: 44, width: 390,
    texts: { label: '798', action: '799' },
    slot: 'section-header'
  },
  'badge': {
    nodeId: '20:800', height: 26, width: 72,
    texts: { label: '801' },
    slot: 'badge'
  },
  'notification-banner': {
    nodeId: '20:802', height: 64, width: 390,
    texts: { title: '805', body: '806' },
    slot: 'banner',
    repeatable: true
  }
};

const SCREEN_W = 390;
const SCREEN_H = 844;
const PADDING_H = 0;    // padding horizontal por defecto

/**
 * Genera el código JS para figma_execute a partir de una composición del engine.
 *
 * @param {Object} composition — respuesta de POST /generate
 * @param {Object} options — { x, y, label }
 * @returns {string} código JS listo para figma_execute
 */
function generatePainterCode(composition, options = {}) {
  const { x = 0, y = 0, label = null } = options;
  const { pattern, components = [], confidence } = composition;

  if (!components || components.length === 0) {
    throw new Error('Composición sin componentes');
  }

  // Separar componentes sticky (top/bottom) del contenido scrollable
  const headerComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'top');
  const bottomComponents  = components.filter(c => _getMeta(c.component)?.sticky === 'bottom');
  const contentComponents = components.filter(c => {
    const meta = _getMeta(c.component);
    return !meta?.sticky;
  });

  // Calcular alturas
  const headerHeight = headerComponents.reduce((sum, c) => sum + _getHeight(c), 0);
  const bottomHeight = bottomComponents.reduce((sum, c) => sum + _getHeight(c), 0);
  const contentHeight = SCREEN_H - headerHeight - bottomHeight;

  const screenName = `gen_${Date.now()} — ${pattern} — ${Math.round((confidence?.global || 0) * 100)}%`;
  const confidenceLabel = label || `☁️ Railway → ${pattern} | confidence: ${Math.round((confidence?.global || 0) * 100)}%`;

  // Construir el código JS
  const lines = [];
  lines.push(`// FigmaPainter v3.1 — ${pattern}`);
  lines.push(`const PAGE_W = ${SCREEN_W};`);
  lines.push(`const PAGE_H = ${SCREEN_H};`);
  lines.push(`const page = figma.currentPage;`);
  lines.push(``);

  // Crear frame contenedor
  lines.push(`// Frame principal`);
  lines.push(`const screen = figma.createFrame();`);
  lines.push(`screen.name = ${JSON.stringify(screenName)};`);
  lines.push(`screen.resize(PAGE_W, PAGE_H);`);
  lines.push(`screen.x = ${x};`);
  lines.push(`screen.y = ${y};`);
  lines.push(`screen.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.97, b: 0.97 } }];`);
  lines.push(`screen.clipsContent = true;`);
  lines.push(`page.appendChild(screen);`);
  lines.push(`let _y = 0;`);
  lines.push(``);

  // Pintar header components
  if (headerComponents.length > 0) {
    lines.push(`// ── Header ────────────────────────────────────`);
    for (const comp of headerComponents) {
      lines.push(..._generateComponentBlock(comp, { fullWidth: true, yFromVar: true }));
    }
    lines.push(``);
  }

  // Pintar content components
  if (contentComponents.length > 0) {
    lines.push(`// ── Content ───────────────────────────────────`);
    const contentPaddingTop = contentComponents.some(c => _getMeta(c.component)?.paddingH)
      ? 24 : 0;
    if (contentPaddingTop > 0) lines.push(`_y += ${contentPaddingTop};`);

    for (const comp of contentComponents) {
      const meta = _getMeta(comp.component);
      const quantity = comp.quantity || 1;
      const paddingH = meta?.paddingH || 0;

      if (meta?.repeatable && quantity > 1) {
        lines.push(`// ${comp.component} x${quantity}`);
        for (let i = 0; i < quantity; i++) {
          lines.push(..._generateComponentBlock(
            { ...comp, _index: i },
            { fullWidth: true, yFromVar: true, paddingH, gap: i > 0 ? 0 : 0 }
          ));
        }
      } else {
        lines.push(..._generateComponentBlock(comp, { fullWidth: true, yFromVar: true, paddingH }));
      }

      // Gap entre secciones de contenido
      lines.push(`_y += 8;`);
    }
    lines.push(``);
  }

  // Pintar bottom components (posición absoluta al fondo)
  if (bottomComponents.length > 0) {
    lines.push(`// ── Bottom (sticky) ──────────────────────────`);
    let bottomOffset = SCREEN_H;
    for (const comp of [...bottomComponents].reverse()) {
      const h = _getHeight(comp);
      bottomOffset -= h;
      lines.push(..._generateComponentBlock(comp, { fullWidth: true, yFixed: bottomOffset }));
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

function _getMeta(componentName) {
  return COMPONENT_REGISTRY[componentName] || null;
}

function _getHeight(comp) {
  const meta = _getMeta(comp.component);
  return meta?.height || 56;
}

/**
 * Genera el bloque de código para clonar y posicionar un componente
 */
function _generateComponentBlock(comp, opts = {}) {
  const { fullWidth = true, yFromVar = false, yFixed = null, paddingH = 0, gap = 0 } = opts;
  const meta = _getMeta(comp.component);
  if (!meta) return [`// WARN: componente no encontrado: ${comp.component}`];

  const nodeId = comp.node_id || meta.nodeId;
  const h = meta.height;
  const w = fullWidth ? SCREEN_W - (paddingH * 2) : meta.width;
  const xPos = paddingH;
  const suffix = comp._index !== undefined ? `_${comp._index}` : '';
  const varName = `_${comp.component.replace(/-/g, '_')}${suffix}`;

  const lines = [];
  lines.push(`{`);
  lines.push(`  const _src = await figma.getNodeByIdAsync('${nodeId}');`);
  lines.push(`  const ${varName} = _src.clone();`);
  lines.push(`  ${varName}.x = ${xPos};`);

  if (yFixed !== null) {
    lines.push(`  ${varName}.y = ${yFixed};`);
  } else if (yFromVar) {
    if (gap > 0) lines.push(`  _y += ${gap};`);
    lines.push(`  ${varName}.y = _y;`);
    lines.push(`  _y += ${h};`);
  }

  lines.push(`  ${varName}.resize(${w}, ${h});`);
  lines.push(`  screen.appendChild(${varName});`);

  // Aplicar props de texto si existen
  if (comp.props && meta.texts) {
    for (const [slot, textNodeSuffix] of Object.entries(meta.texts)) {
      const propValue = comp.props[slot];
      if (propValue) {
        lines.push(`  {`);
        lines.push(`    const _t = ${varName}.findOne(n => n.type === 'TEXT' && n.name === '${slot}');`);
        lines.push(`    if (_t) { await figma.loadFontAsync(_t.fontName); _t.characters = ${JSON.stringify(String(propValue))}; }`);
        lines.push(`  }`);
      }
    }
  }

  lines.push(`}`);
  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Devuelve el código JS para figma_execute
 */
function paint(composition, options = {}) {
  return generatePainterCode(composition, options);
}

/**
 * Devuelve el registry de componentes (para diagnóstico)
 */
function getRegistry() {
  return COMPONENT_REGISTRY;
}

module.exports = { paint, getRegistry, COMPONENT_REGISTRY };
