// DS IA-Ready Engine — Figma Plugin v2.0
// Thin HTTP client. Toda la lógica vive en el Engine (Railway).

var ENGINE_URL = 'https://ds-ia-ready-engine-production.up.railway.app';
var ENGINE_API_KEY = 'dev-key-local-2025';

// Node IDs canónicos del Simple DS
var COMPONENT_NODE_IDS = {
  // navigation-header — 3 variantes reales según nivel de navegación
  'navigation-header':              '112:1853', // Type=Predeterminada (L1) — por defecto
  'navigation-header/dashboard':    '170:2660', // Type=Dashboard (L0)
  'navigation-header/modal':        '170:2843', // Type=Modal (L2/L3)
  'button-primary':           '1:9',
  'button-secondary':         '1:11',
  'card-item':                '1:13',
  'input-text':               '1:21',
  'filter-bar':               '1:24',
  'empty-state':              '1:31',
  'modal-bottom-sheet':       '1:36',
  'tab-bar':                  '20:784',
  'list-header':              '20:797',
  'badge':                    '20:800',
  'notification-banner':      '20:802',
  'amount-display':           '137:1740',
  'chart-sparkline':          '137:1746',
  'skeleton-loader':          '137:1752',
  'card-item/financial':      '137:1758',
  'card-item/financial-expense': '137:1769',
};

var HEIGHT_MAP = {
  'navigation-header':              56,
  'navigation-header/dashboard':    56,
  'navigation-header/modal':        56,
  'filter-bar':                  48,
  'card-item':                   72,
  'button-primary':              52,
  'button-secondary':            52,
  'input-text':                  56,
  'empty-state':                 244,
  'modal-bottom-sheet':          280,
  'tab-bar':                     56,
  'list-header':                 44,
  'badge':                       26,
  'notification-banner':         64,
  'amount-display':              126,
  'chart-sparkline':             80,
  'skeleton-loader':             72,
  'card-item/financial':         72,
  'card-item/financial-expense': 72,
};

// ─── MENSAJES DESDE LA UI ─────────────────────────────────────────────────────

figma.ui.onmessage = function(msg) {

  if (msg.type === 'generate') {
    handleGenerate(msg.brief, msg.patternOverride, msg.geography);
  }

  if (msg.type === 'paint') {
    handlePaint(msg.data);
  }

  if (msg.type === 'get-selection') {
    handleGetSelection();
  }

  if (msg.type === 'save-doc') {
    handleSaveDoc(msg.content);
  }

  if (msg.type === 'ping') {
    handlePing();
  }

  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// ─── PING ─────────────────────────────────────────────────────────────────────

function handlePing() {
  fetch(ENGINE_URL + '/health')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      figma.ui.postMessage({ type: 'ping-result', ok: true, data: data });
    })
    .catch(function(e) {
      figma.ui.postMessage({ type: 'ping-result', ok: false, error: e.message });
    });
}

// ─── GENERATE (compatibilidad hacia atrás) ────────────────────────────────────

function handleGenerate(brief, patternOverride, geography) {
  figma.ui.postMessage({ type: 'status', text: 'Llamando al engine...' });

  var body = { brief: brief };
  if (patternOverride) body.pattern = patternOverride;
  if (geography) body.geography = geography;

  fetch(ENGINE_URL + '/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': ENGINE_API_KEY },
    body: JSON.stringify(body),
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.error) {
      figma.ui.postMessage({ type: 'error', text: data.message || data.error });
      return;
    }
    return handlePaint(data);
  })
  .catch(function(e) {
    figma.ui.postMessage({ type: 'error', text: 'Error de red: ' + e.message });
  });
}

// ─── PAINT — ejecuta código JS en Figma vía figma.currentPage ─────────────────

async function handlePaint(engineResponse) {
  figma.ui.postMessage({ type: 'status', text: 'Pintando pantalla...' });

  // ── Flujo multipantalla ───────────────────────────────────────────────────
  if (engineResponse.screens && engineResponse.screens.length > 1) {
    return paintFlow(engineResponse);
  }

  var components = engineResponse.components || [];
  var pattern    = engineResponse.pattern || 'unknown';
  var confidence = engineResponse.confidence || {};
  var score      = Math.round((confidence.global || 0) * 100);

  // Buscar posición X libre en el canvas
  var existingFrames = figma.currentPage.children.filter(function(n) {
    return n.type === 'FRAME';
  });
  var xPos = 0;
  if (existingFrames.length > 0) {
    var lastFrame = existingFrames[existingFrames.length - 1];
    xPos = lastFrame.x + lastFrame.width + 60;
  }

  var SCREEN_W = 390;
  var SCREEN_H = 844;

  // Crear frame
  var screenFrame = figma.createFrame();
  screenFrame.name = 'gen_' + Date.now() + ' — ' + pattern + ' — ' + score + '%';
  screenFrame.resize(SCREEN_W, SCREEN_H);
  screenFrame.x = xPos;
  screenFrame.y = 0;
  screenFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  screenFrame.clipsContent = true;

  figma.currentPage.appendChild(screenFrame);

  // Separar componentes por zona
  var topComps     = components.filter(function(c) { return isSticky(c.component, 'top'); });
  var bottomComps  = components.filter(function(c) { return isSticky(c.component, 'bottom'); });
  var contentComps = components.filter(function(c) {
    return !isSticky(c.component, 'top') && !isSticky(c.component, 'bottom');
  });

  var yPos = 0;

  // Header — await para que yPos sea un número real
  for (var hi = 0; hi < topComps.length; hi++) {
    yPos = await paintComponent(screenFrame, topComps[hi], 0, yPos, SCREEN_W);
  }

  // Content — await en cada componente para que yPos acumule correctamente
  yPos += 12; // padding top del contenido
  for (var ci = 0; ci < contentComps.length; ci++) {
    if (ci > 0) yPos += getGap(contentComps[ci-1].component, contentComps[ci].component);
    yPos = await paintComponent(screenFrame, contentComps[ci], 0, yPos, SCREEN_W);
  }

  // Bottom (posición absoluta desde abajo)
  var bottomOffset = SCREEN_H;
  var sortedBottom = [...bottomComps].reverse();
  for (var bi = 0; bi < sortedBottom.length; bi++) {
    var h = HEIGHT_MAP[sortedBottom[bi].component] || 56;
    bottomOffset -= h;
    await paintComponent(screenFrame, sortedBottom[bi], 0, bottomOffset, SCREEN_W);
  }

  // Label flotante encima del frame
  var label = figma.createText();
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  label.fontName = { family: 'Inter', style: 'Medium' };
  label.fontSize = 11;
  label.characters = '☁️ ' + pattern + ' · ' + score + '% · ' + new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.4 } }];
  label.x = xPos;
  label.y = -28;
  figma.currentPage.appendChild(label);

  figma.currentPage.selection = [screenFrame];
  figma.viewport.scrollAndZoomIntoView([screenFrame]);

  figma.ui.postMessage({
    type: 'paint-done',
    screenId: screenFrame.id,
    pattern: pattern,
    score: score,
  });
}

// ─── PAINT FLOW — pinta un flujo multipantalla con conectores ─────────────────

async function paintFlow(engineResponse) {
  var screens = engineResponse.screens || [];
  var pattern = engineResponse.pattern || 'flujo';
  var score   = Math.round(((engineResponse.confidence || {}).global || 0) * 100);

  figma.ui.postMessage({ type: 'status', text: 'Pintando flujo de ' + screens.length + ' pantallas...' });

  var SCREEN_W  = 390;
  var SCREEN_H  = 844;
  var GAP       = 120;   // espacio entre pantallas
  var ARROW_H   = 24;    // alto del conector visual

  // Punto de partida — a la derecha del último frame existente
  var existingFrames = figma.currentPage.children.filter(function(n) { return n.type === 'FRAME'; });
  var startX = 0;
  if (existingFrames.length > 0) {
    var last = existingFrames[existingFrames.length - 1];
    startX = last.x + last.width + 60;
  }

  var allFrames = [];
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' });
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });

  for (var si = 0; si < screens.length; si++) {
    var screen     = screens[si];
    var xPos       = startX + si * (SCREEN_W + GAP);
    var components = screen.components || [];
    var navLevel   = screen.nav_level || ('L' + si);
    var screenName = screen.screen_name || screen.pattern || ('Pantalla ' + (si + 1));
    var screenScore = Math.round(((screen.confidence || {}).global || score) * 100);

    // ── Crear frame ──────────────────────────────────────────────────────────
    var frame = figma.createFrame();
    frame.name = navLevel + ' — ' + screenName + ' — ' + screenScore + '%';
    frame.resize(SCREEN_W, SCREEN_H);
    frame.x = xPos;
    frame.y = 60; // dejar espacio arriba para el label
    frame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    frame.clipsContent = true;
    figma.currentPage.appendChild(frame);
    allFrames.push(frame);

    // ── Pintar componentes ───────────────────────────────────────────────────
    var topComps     = components.filter(function(c) { return isSticky(c.component, 'top'); });
    var bottomComps  = components.filter(function(c) { return isSticky(c.component, 'bottom'); });
    var contentComps = components.filter(function(c) {
      return !isSticky(c.component, 'top') && !isSticky(c.component, 'bottom');
    });

    var yPos = 0;
    for (var hi = 0; hi < topComps.length; hi++) {
      yPos = await paintComponent(frame, topComps[hi], 0, yPos, SCREEN_W);
    }
    yPos += 12;
    for (var ci = 0; ci < contentComps.length; ci++) {
      if (ci > 0) yPos += getGap(contentComps[ci-1].component, contentComps[ci].component);
      yPos = await paintComponent(frame, contentComps[ci], 0, yPos, SCREEN_W);
    }
    var bottomOffset = SCREEN_H;
    var sortedBottom = bottomComps.slice().reverse();
    for (var bi = 0; bi < sortedBottom.length; bi++) {
      var bh = HEIGHT_MAP[sortedBottom[bi].component] || 56;
      bottomOffset -= bh;
      await paintComponent(frame, sortedBottom[bi], 0, bottomOffset, SCREEN_W);
    }

    // ── Label sobre el frame ─────────────────────────────────────────────────
    var badge = figma.createText();
    badge.fontName = { family: 'Inter', style: 'Medium' };
    badge.fontSize = 11;
    badge.characters = navLevel + ' · ' + screenName + ' · ' + screenScore + '%';
    badge.fills = [{ type: 'SOLID', color: { r: 0.31, g: 0.29, b: 0.9 } }];
    badge.x = xPos;
    badge.y = 30;
    figma.currentPage.appendChild(badge);

    // ── Número de paso ───────────────────────────────────────────────────────
    var stepLabel = figma.createText();
    stepLabel.fontName = { family: 'Inter', style: 'Medium' };
    stepLabel.fontSize = 10;
    stepLabel.characters = (si + 1) + ' / ' + screens.length;
    stepLabel.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
    stepLabel.x = xPos + SCREEN_W - 40;
    stepLabel.y = 30;
    figma.currentPage.appendChild(stepLabel);

    // ── Conector → entre pantallas ───────────────────────────────────────────
    if (si < screens.length - 1) {
      var arrowX = xPos + SCREEN_W + 20;
      var arrowY = 60 + (SCREEN_H / 2) - 10;

      // Línea
      var line = figma.createLine();
      line.x = arrowX;
      line.y = arrowY;
      line.resize(GAP - 40, 0);
      line.strokes = [{ type: 'SOLID', color: { r: 0.31, g: 0.29, b: 0.9 } }];
      line.strokeWeight = 2;
      figma.currentPage.appendChild(line);

      // Flecha (texto)
      var arrow = figma.createText();
      arrow.fontName = { family: 'Inter', style: 'Medium' };
      arrow.fontSize = 18;
      arrow.characters = '→';
      arrow.fills = [{ type: 'SOLID', color: { r: 0.31, g: 0.29, b: 0.9 } }];
      arrow.x = arrowX + (GAP - 40) / 2 - 8;
      arrow.y = arrowY - 14;
      figma.currentPage.appendChild(arrow);

      // Acción que dispara la transición
      var nextScreen = screens[si + 1];
      var actionText = (nextScreen && nextScreen.screen_name) ? '→ ' + nextScreen.screen_name : '';
      if (actionText) {
        var actionLabel = figma.createText();
        actionLabel.fontName = { family: 'Inter', style: 'Regular' };
        actionLabel.fontSize = 9;
        actionLabel.characters = actionText;
        actionLabel.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.6 } }];
        actionLabel.x = arrowX;
        actionLabel.y = arrowY + 14;
        figma.currentPage.appendChild(actionLabel);
      }
    }
  }

  // ── Título del flujo ─────────────────────────────────────────────────────
  var flowTitle = figma.createText();
  flowTitle.fontName = { family: 'Inter', style: 'Medium' };
  flowTitle.fontSize = 13;
  flowTitle.characters = '⚡ Flujo: ' + pattern + ' · ' + screens.length + ' pantallas · ' + score + '%';
  flowTitle.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.2 } }];
  flowTitle.x = startX;
  flowTitle.y = 8;
  figma.currentPage.appendChild(flowTitle);

  // ── Seleccionar todos los frames del flujo ────────────────────────────────
  figma.currentPage.selection = allFrames;
  figma.viewport.scrollAndZoomIntoView(allFrames);

  figma.ui.postMessage({
    type: 'paint-done',
    screenId: allFrames[0] ? allFrames[0].id : null,
    pattern:  pattern,
    score:    score,
    is_flow:  true,
    screen_count: screens.length,
  });
}

// ─── PAINT COMPONENT ─────────────────────────────────────────────────────────

function paintComponent(parent, comp, x, y, screenW) {
  var name   = comp.component;

  // Resolver variante del navigation-header según lo que indica el engine/template
  var resolvedName = name;
  if (name === 'navigation-header') {
    var variant = (comp.variant || '').toLowerCase();
    if (variant.includes('dashboard') || variant === 'type=dashboard') {
      resolvedName = 'navigation-header/dashboard';
    } else if (variant.includes('modal') || variant === 'type=modal') {
      resolvedName = 'navigation-header/modal';
    }
    // Type=Predeterminada usa el default 'navigation-header'
  }

  var nodeId = comp.node_id && comp.node_id !== 'pending'
    ? comp.node_id
    : COMPONENT_NODE_IDS[resolvedName] || COMPONENT_NODE_IDS[name];
  var h      = HEIGHT_MAP[name] || 56;
  var margin = getMarginH(name);
  var w      = screenW - (margin * 2);

  if (!nodeId) {
    // Placeholder si no hay node ID
    var rect = figma.createRectangle();
    rect.name = name;
    rect.x = x + margin;
    rect.y = y;
    rect.resize(w, h);
    rect.fills = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.95 } }];
    rect.cornerRadius = 8;
    parent.appendChild(rect);
    return y + h;
  }

  // Clonar desde el DS
  return figma.getNodeByIdAsync(nodeId).then(function(srcNode) {
    if (!srcNode) {
      console.warn('Node not found: ' + nodeId + ' (' + name + ')');
      return y + h;
    }
    var clone = srcNode.clone();
    clone.x = x + margin;
    clone.y = y;
    clone.resize(w, h);
    if (margin > 0 && name !== 'button-primary' && name !== 'button-secondary') {
      if ('cornerRadius' in clone) clone.cornerRadius = 12;
    }
    parent.appendChild(clone);

    // Aplicar props de texto
    applyTextProps(clone, comp.props || {});

    return y + h;
  }).catch(function() { return y + h; });
}

// ─── APPLY TEXT PROPS ─────────────────────────────────────────────────────────

function applyTextProps(node, props) {
  var TEXT_SLOTS = {
    'navigation-header': ['title', 'subtitle'],
    'button-primary':    ['label'],
    'button-secondary':  ['label'],
    'card-item':         ['title', 'subtitle', 'value'],
    'input-text':        ['label', 'placeholder'],
    'empty-state':       ['title', 'description', 'action_label'],
    'notification-banner': ['title', 'message'],
    'list-header':       ['title', 'action_label'],
  };

  var slots = TEXT_SLOTS[node.name] || [];
  slots.forEach(function(slot) {
    if (!props[slot]) return;
    var textNode = node.findOne(function(n) { return n.type === 'TEXT' && n.name === slot; });
    if (textNode) {
      figma.loadFontAsync(textNode.fontName).then(function() {
        textNode.characters = String(props[slot]);
      });
    }
  });
}

// ─── GET SELECTION — para Studio/Validar ──────────────────────────────────────

function normalizeCompName(str) {
  // Normaliza nombres de componentes para matching robusto
  // "Card Item / Financial" → "card-item/financial"
  // "navigation header" → "navigation-header"
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-\/]/g, '')
    .replace(/-+/g, '-');
}

function matchComponentName(rawName, knownNames) {
  var norm = normalizeCompName(rawName);
  // 1. Match exacto
  var exact = knownNames.find(function(k) { return k === norm; });
  if (exact) return exact;
  // 2. El nombre del componente contiene la clave canónica
  var contains = knownNames.find(function(k) { return norm.includes(k); });
  if (contains) return contains;
  // 3. La clave canónica contiene el nombre
  var reverse = knownNames.find(function(k) { return k.includes(norm); });
  if (reverse) return reverse;
  // 4. Match parcial — primer segmento antes de '/' o ' '
  var base = norm.split('/')[0].split(' ')[0];
  if (base.length > 3) {
    var partial = knownNames.find(function(k) { return k.startsWith(base); });
    if (partial) return partial;
  }
  return null;
}

function handleGetSelection() {
  var selection = figma.currentPage.selection;

  if (!selection || selection.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  var frame = selection[0];
  if (frame.type !== 'FRAME') {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  // IDs canónicos invertidos para lookup rápido: nodeId → componentName
  var NODE_ID_TO_NAME = {};
  Object.keys(COMPONENT_NODE_IDS).forEach(function(name) {
    NODE_ID_TO_NAME[COMPONENT_NODE_IDS[name]] = name;
  });

  var components = [];
  var knownNames = Object.keys(COMPONENT_NODE_IDS);

  frame.children.forEach(function(child, index) {
    var isInstance = child.type === 'INSTANCE';
    var detached   = false;
    var matched    = null;

    if (isInstance) {
      var mainComp = child.mainComponent;
      if (mainComp) {
        // 1. Match por nodeId exacto del mainComponent
        matched = NODE_ID_TO_NAME[mainComp.id] || null;

        // 2. Match por nodeId del componentSet (variantes)
        if (!matched && mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
          matched = NODE_ID_TO_NAME[mainComp.parent.id] || null;
        }

        // 3. Match por nombre normalizado del mainComponent
        if (!matched) {
          matched = matchComponentName(mainComp.name, knownNames);
        }

        // 4. Match por nombre del componentSet si existe
        if (!matched && mainComp.parent && mainComp.parent.type === 'COMPONENT_SET') {
          matched = matchComponentName(mainComp.parent.name, knownNames);
        }
      }
    }

    // 5. Fallback: nombre del layer del frame hijo
    if (!matched) {
      matched = matchComponentName(child.name, knownNames);
      if (matched && !isInstance) {
        detached = true;
      }
    }

    if (matched) {
      components.push({
        component: matched,
        order:      index + 1,
        node_id:    COMPONENT_NODE_IDS[matched],
        is_instance: isInstance,
        detached:    detached,
      });
    } else {
      // Registrar no reconocidos para debug
      console.warn('[Studio] Componente no reconocido:', child.name, child.type);
    }
  });

  if (components.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  var detachedCount = components.filter(function(c) { return c.detached; }).length;

  figma.ui.postMessage({
    type: 'selection-data',
    components: components,
    frameId: frame.id,
    frameName: frame.name,
    detached_count: detachedCount,
  });
}

// ─── SAVE DOC — copia el .md al clipboard del sistema ──────────────────────────

function handleSaveDoc(content) {
  // En Figma plugin no hay acceso al filesystem — notificamos y
  // mostramos el contenido en la consola para que el usuario lo copie
  figma.notify('📄 Doc generada — cópiala desde la consola del plugin');
  console.log('=== SCREEN DOC ===\n' + content + '\n=== END DOC ===');
  figma.ui.postMessage({ type: 'export-done', message: 'Doc generada — disponible en la consola del plugin' });
}

// ─── SPACING HELPERS ──────────────────────────────────────────────────────────

function isSticky(name, zone) {
  var TOP    = ['navigation-header'];
  var BOTTOM = ['tab-bar', 'button-primary', 'button-secondary', 'modal-bottom-sheet'];
  if (zone === 'top')    return TOP.indexOf(name) !== -1;
  if (zone === 'bottom') return BOTTOM.indexOf(name) !== -1;
  return false;
}

function getMarginH(name) {
  var EDGE_TO_EDGE = ['navigation-header', 'filter-bar', 'notification-banner', 'list-header', 'card-item', 'tab-bar', 'empty-state', 'modal-bottom-sheet'];
  return EDGE_TO_EDGE.indexOf(name) !== -1 ? 0 : 16;
}

function getGap(prevName, nextName) {
  var SECTION_GROUPS = {
    'list-header': 'section',
    'card-item':   'list',
    'input-text':  'form',
  };
  if (nextName === 'list-header') return 24;
  if (prevName === 'list-header') return 0;
  if (SECTION_GROUPS[prevName] && SECTION_GROUPS[prevName] === SECTION_GROUPS[nextName]) return 1;
  if (prevName === 'filter-bar' || prevName === 'notification-banner') return 16;
  return 24;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

figma.showUI(__html__, {
  width: 420,
  height: 680,
  title: 'DS IA-Ready Engine',
});
