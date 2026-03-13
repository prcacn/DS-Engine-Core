// DS IA-Ready Engine — Figma Plugin v2.0
// Thin HTTP client. Toda la lógica vive en el Engine (Railway).

var ENGINE_URL = 'https://ds-ia-ready-engine-production.up.railway.app';
var ENGINE_API_KEY = 'dev-key-local-2025';

// Node IDs canónicos del Simple DS
var COMPONENT_NODE_IDS = {
  'navigation-header':  '1:3',
  'button-primary':     '1:9',
  'button-secondary':   '1:11',
  'card-item':          '1:13',
  'input-text':         '1:21',
  'filter-bar':         '1:24',
  'empty-state':        '1:31',
  'modal-bottom-sheet': '1:36',
  'tab-bar':            '20:784',
  'list-header':        '20:797',
  'badge':              '20:800',
  'notification-banner':'20:802',
};

var HEIGHT_MAP = {
  'navigation-header': 56,
  'filter-bar': 48,
  'card-item': 72,
  'button-primary': 52,
  'button-secondary': 52,
  'input-text': 56,
  'empty-state': 244,
  'modal-bottom-sheet': 280,
  'tab-bar': 56,
  'list-header': 44,
  'badge': 26,
  'notification-banner': 64,
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
  screenFrame.fills = [{ type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.99 } }];
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

// ─── PAINT COMPONENT ─────────────────────────────────────────────────────────

function paintComponent(parent, comp, x, y, screenW) {
  var name   = comp.component;
  var nodeId = comp.node_id && comp.node_id !== 'pending' ? comp.node_id : COMPONENT_NODE_IDS[name];
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

  // Leer los componentes del frame por nombre
  var components = [];
  var knownNames = Object.keys(COMPONENT_NODE_IDS);

  frame.children.forEach(function(child, index) {
    var name = child.name.toLowerCase().replace(/\s+/g, '-');
    // Intentar matchear con nombres canónicos
    var matched = knownNames.find(function(k) {
      return name.includes(k) || k.includes(name);
    });
    if (matched) {
      components.push({
        component: matched,
        order: index + 1,
        node_id: COMPONENT_NODE_IDS[matched],
      });
    }
  });

  if (components.length === 0) {
    figma.ui.postMessage({ type: 'selection-empty' });
    return;
  }

  figma.ui.postMessage({
    type: 'selection-data',
    components: components,
    frameId: frame.id,
    frameName: frame.name,
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
