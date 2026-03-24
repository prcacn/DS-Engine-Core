// DS IA-Ready Engine — Figma Plugin v2.0
// Thin HTTP client. Toda la lógica vive en el Engine (Railway).

var ENGINE_URL = 'https://ds-ia-ready-engine-production.up.railway.app';
var ENGINE_API_KEY = 'dev-key-local-2025';

// Node IDs canónicos del Simple DS
// REGLA: usar siempre el COMPONENT_SET padre, no la variante suelta.
// paintComponent llama a defaultVariant.createInstance() sobre el COMPONENT_SET.
var COMPONENT_NODE_IDS = {
  // navigation-header — COMPONENT_SET con 3 variantes (Type=Predeterminada/Modal/Dashboard)
  'navigation-header':              '170:2653', // COMPONENT_SET — defaultVariant = Type=Predeterminada
  'navigation-header/dashboard':    '170:2660', // variante específica Type=Dashboard (L0)
  'navigation-header/modal':        '170:2843', // variante específica Type=Modal (L2/L3)
  'button-primary':                 '185:3893', // COMPONENT_SET
  'button-secondary':               '185:3894', // COMPONENT_SET
  'card-item':                      '185:3895', // COMPONENT_SET
  'input-text':                     '185:3896', // COMPONENT_SET
  'filter-bar':                     '185:3897', // COMPONENT_SET
  'empty-state':                    '185:3898', // COMPONENT_SET
  'modal-bottom-sheet':             '185:3899', // COMPONENT_SET
  'tab-bar':                        '185:3900', // COMPONENT_SET
  'list-header':                    '185:3901', // COMPONENT_SET
  'badge':                          '185:3902', // COMPONENT_SET
  'notification-banner':            '185:3903', // COMPONENT_SET
  'card-item/financial':            '185:3904', // COMPONENT_SET
  'card-item/financial-expense':    '185:3905', // COMPONENT_SET
  'amount-display':                 '185:3906', // COMPONENT_SET
  'skeleton-loader':                '185:3908', // COMPONENT_SET
  'card-summary':                   '185:3918', // COMPONENT_SET
  'card-item/account':              '185:3928', // COMPONENT_SET
  'chart-sparkline':                '137:1746', // COMPONENT (sin set)
  'card-media':                     '217:2086', // COMPONENT_SET
};

// Alturas de referencia auditadas directamente desde Figma (solo para fallback/placeholder)
// En paintComponent se usa instance.height — estos valores NO se usan para resize
var HEIGHT_MAP = {
  'navigation-header':              56,
  'navigation-header/dashboard':    56,
  'navigation-header/modal':        56,
  'button-primary':                 48,  // auditado: State=Predeterminada 48px
  'button-secondary':               48,
  'card-item':                      72,
  'card-item/financial':            72,
  'card-item/financial-expense':    72,
  'card-item/account':              72,
  'card-summary':                   120,
  'card-media':                     295, // variante vertical
  'input-text':                     50,  // auditado: State=Default 50px
  'filter-bar':                     48,
  'empty-state':                    236, // auditado: 236px
  'modal-bottom-sheet':             255, // auditado: 255px
  'tab-bar':                        56,
  'list-header':                    44,
  'badge':                          26,
  'notification-banner':            64,
  'amount-display':                 126,
  'chart-sparkline':                80,
  'skeleton-loader':                72,
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

// ─── NORMALIZAR RESPUESTA DEL ENGINE ─────────────────────────────────────────
// Acepta tanto el shape de /generate como el de /render y los unifica
// antes de pasarlos a handlePaint.
//
// /generate devuelve: { components, pattern, confidence, screens, ... }
// /render devuelve:   { html, components, meta: { pattern, score, intent, ... } }
//
function normalizeEngineResponse(data) {
  // Si ya tiene el shape de /generate (confidence directo), no tocar
  if (data.confidence && typeof data.confidence.global === 'number') {
    return data;
  }
  // Si viene de /render (confidence dentro de meta.score)
  if (data.meta && data.meta.score) {
    var meta  = data.meta;
    var score = meta.score || {};
    return {
      components:  data.components  || [],
      pattern:     meta.pattern     || data.pattern || 'unknown',
      brief:       meta.brief       || '',
      screen_id:   'render_' + Date.now(),
      flow_type:   'single',
      screens:     null,
      // Normalizar confidence al shape que usa handlePaint
      confidence: {
        global:   score.global   || 0,
        status:   score.status   || 'AUTO_APPROVE',
        signals: {
          contract_coverage: (score.signals && score.signals.contract_coverage) || score.contract  || 0,
          intent_clarity:    (score.signals && score.signals.intent_clarity)    || score.intent    || 0,
          precedent:         (score.signals && score.signals.precedent)         || score.precedent || 0,
          rule_compliance:   (score.signals && score.signals.rule_compliance)   || score.rules     || 0,
        },
      },
      intent:      meta.intent    || {},
      kb_rules:    data.kb_rules  || meta.kb_rules || [],
      kb_changes:  data.kb_changes || [],
      violations:  data.violations || [],
      html:        data.html || null,
    };
  }
  // Fallback — devolver tal cual
  return data;
}

function handleGenerate(brief, patternOverride, geography) {
  figma.ui.postMessage({ type: 'status', text: 'Llamando al engine...' });

  var body = { brief: brief };
  if (patternOverride) body.pattern = patternOverride;
  if (geography)       body.geography = geography;

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
    return handlePaint(normalizeEngineResponse(data));
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

// ─── SPACING TOKENS (inline desde spacingRegistry / layoutRules) ─────────────
// Valores mobile — fuente de verdad: Figma Spacing page + tokens DS
var DS_SPACING = {
  screenWidth:    390,
  marginScreen:   16,   // Padding/Horizontal/MD
  paddingTop:     12,   // Padding/Vertical/MD
  paddingBottom:  16,   // Padding/Horizontal/MD
  gapSection:      8,   // Gap/MD — entre bloques distintos
  gapItem:         0,   // Gap/XS — entre cards consecutivas (flush)
  gapForm:        12,   // Gap/LG — entre inputs
};

// Componentes que van a ancho completo (sin margen lateral)
var FULL_WIDTH = [
  'navigation-header', 'filter-bar', 'notification-banner',
  'list-header', 'card-item', 'card-item/financial',
  'card-item/financial-expense', 'card-item/account',
  'tab-bar', 'empty-state', 'modal-bottom-sheet',
  'skeleton-loader',
];

// ─── PAINT COMPONENT ─────────────────────────────────────────────────────────

function paintComponent(parent, comp, x, y, screenW) {
  var name = comp.component;

  // Resolver variante del navigation-header
  var resolvedName = name;
  if (name === 'navigation-header') {
    var variant = (comp.variant || '').toLowerCase();
    if (variant.includes('dashboard') || variant === 'type=dashboard') {
      resolvedName = 'navigation-header/dashboard';
    } else if (variant.includes('modal') || variant === 'type=modal') {
      resolvedName = 'navigation-header/modal';
    }
  }

  var nodeId = comp.node_id && comp.node_id !== 'pending'
    ? comp.node_id
    : COMPONENT_NODE_IDS[resolvedName] || COMPONENT_NODE_IDS[name];

  // Margen horizontal — 0 para fullwidth, DS_SPACING.marginScreen para el resto
  var margin = FULL_WIDTH.indexOf(name) !== -1 ? 0 : DS_SPACING.marginScreen;
  var w = screenW - (margin * 2);

  if (!nodeId) {
    // Placeholder si no hay node ID
    var rect = figma.createRectangle();
    rect.name = name + ' (placeholder)';
    rect.x = x + margin;
    rect.y = y;
    rect.resize(w, HEIGHT_MAP[name] || 56);
    rect.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.97 } }];
    rect.cornerRadius = 8;
    parent.appendChild(rect);
    return Promise.resolve(y + (HEIGHT_MAP[name] || 56));
  }

  return figma.getNodeByIdAsync(nodeId).then(function(srcNode) {
    if (!srcNode) {
      console.warn('[Plugin] Node not found: ' + nodeId + ' (' + name + ')');
      return y + (HEIGHT_MAP[name] || 56);
    }

    // ── CREAR INSTANCIA — no clonar ──────────────────────────────────────────
    // createInstance() mantiene el vínculo al componente maestro.
    // clone() produce una copia muerta desvinculada — NUNCA usar para componentes DS.
    //
    // COMPONENT_SET → usar defaultVariant (la primera variante definida en el set)
    // COMPONENT     → createInstance() directamente
    var instance;
    if (srcNode.type === 'COMPONENT_SET') {
      var defaultVariant = srcNode.defaultVariant || srcNode.children[0];
      if (!defaultVariant) {
        console.warn('[Plugin] COMPONENT_SET sin variantes: ' + nodeId + ' (' + name + ')');
        return y + (HEIGHT_MAP[name] || 56);
      }
      instance = defaultVariant.createInstance();
    } else if (srcNode.type === 'COMPONENT') {
      instance = srcNode.createInstance();
    } else {
      console.warn('[Plugin] Node ' + nodeId + ' es ' + srcNode.type + ' — usando clone como fallback');
      instance = srcNode.clone();
    }

    instance.name = name;
    instance.x = x + margin;
    instance.y = y;

    // ── RESIZE SOLO EN X — nunca forzar altura ───────────────────────────────
    // La altura la dicta el componente según sus tokens de spacing internos.
    // Forzar Y destruye los auto-layout y los boundVariables del componente.
    var nativeH = instance.height;
    if (instance.width !== w) {
      instance.resize(w, nativeH);
    }

    parent.appendChild(instance);

    // Aplicar props de texto
    applyTextProps(instance, comp.props || {});

    // Acumular _y con la altura REAL de la instancia
    return y + instance.height;

  }).catch(function(e) {
    console.error('[Plugin] paintComponent error:', name, e.message);
    return y + (HEIGHT_MAP[name] || 56);
  });
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

// Mapa inverso: nodeId → nombre canónico
// También incluye IDs de componentSets padre para variantes
var COMPONENT_ID_TO_NAME = null;

function buildIdMap() {
  if (COMPONENT_ID_TO_NAME) return COMPONENT_ID_TO_NAME;
  COMPONENT_ID_TO_NAME = {};
  Object.keys(COMPONENT_NODE_IDS).forEach(function(name) {
    COMPONENT_ID_TO_NAME[COMPONENT_NODE_IDS[name]] = name;
  });
  return COMPONENT_ID_TO_NAME;
}

function normalizeCompName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-\/]/g, '')
    .replace(/-+/g, '-');
}

function matchByName(rawName, knownNames) {
  var norm = normalizeCompName(rawName);
  // Ignorar nombres que son solo variantes: "State=Default", "Type=Dashboard"
  if (norm.startsWith('state=') || norm.startsWith('type=') || norm === 'default') return null;
  var exact    = knownNames.find(function(k) { return k === norm; });
  if (exact) return exact;
  var contains = knownNames.find(function(k) { return norm.includes(k); });
  if (contains) return contains;
  var reverse  = knownNames.find(function(k) { return k.includes(norm) && norm.length > 4; });
  if (reverse) return reverse;
  // Match por primer segmento antes de '/'
  var base = norm.split('/')[0];
  if (base.length > 4) {
    var partial = knownNames.find(function(k) { return k.startsWith(base) || base.startsWith(k); });
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

  var idMap      = buildIdMap();
  var knownNames = Object.keys(COMPONENT_NODE_IDS);
  var components = [];

  frame.children.forEach(function(child, index) {
    var matched  = null;
    var detached = false;

    // ESTRATEGIA 1: match por nodeId del propio nodo
    // Funciona cuando el engine clona el nodo maestro directamente (type=COMPONENT)
    matched = idMap[child.id] || null;

    // ESTRATEGIA 2: es INSTANCE — leer mainComponent
    if (!matched && child.type === 'INSTANCE') {
      var mc = child.mainComponent;
      if (mc) {
        // Por ID del mainComponent
        matched = idMap[mc.id] || null;
        // Por ID del componentSet padre (variantes)
        if (!matched && mc.parent && mc.parent.type === 'COMPONENT_SET') {
          matched = idMap[mc.parent.id] || null;
        }
        // Por nombre del mainComponent
        if (!matched) matched = matchByName(mc.name, knownNames);
        // Por nombre del componentSet
        if (!matched && mc.parent && mc.parent.type === 'COMPONENT_SET') {
          matched = matchByName(mc.parent.name, knownNames);
        }
      }
    }

    // ESTRATEGIA 3: es COMPONENT clonado — buscar por nombre del layer
    // Los clones directos tienen el nombre de la variante ("Type=Dashboard")
    // pero el parent del nodo original tiene el nombre del componentSet
    if (!matched && child.type === 'COMPONENT') {
      // Intentar por nombre del layer ignorando variantes puras
      matched = matchByName(child.name, knownNames);
      // Si el nombre es solo una variante (State=Default), buscar por posición
      // usando el nodeId del padre si está disponible
      if (!matched && child.parent) {
        matched = matchByName(child.parent.name, knownNames);
      }
    }

    // ESTRATEGIA 4: fallback por nombre del layer (cubre FRAME, GROUP detacheados)
    if (!matched) {
      matched = matchByName(child.name, knownNames);
      if (matched && child.type !== 'INSTANCE' && child.type !== 'COMPONENT') {
        detached = true;
      }
    }

    if (matched) {
      components.push({
        component:   matched,
        order:       index + 1,
        node_id:     COMPONENT_NODE_IDS[matched],
        is_instance: child.type === 'INSTANCE' || child.type === 'COMPONENT',
        detached:    detached,
      });
    } else {
      console.warn('[Studio] Sin match:', child.type, child.name, child.id);
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
  // Mantenida por compatibilidad — usar FULL_WIDTH array en paintComponent
  return FULL_WIDTH.indexOf(name) !== -1 ? 0 : DS_SPACING.marginScreen;
}

function getGap(prevName, nextName) {
  // Gaps desde tokens del DS (spacingRegistry)
  // card-item consecutivas: Gap/XS = 0 (flush)
  var LIST_ITEMS = ['card-item','card-item/financial','card-item/financial-expense','card-item/account','skeleton-loader'];
  if (LIST_ITEMS.indexOf(prevName) !== -1 && LIST_ITEMS.indexOf(nextName) !== -1) return 0;
  // list-header precede a su grupo sin gap
  if (prevName === 'list-header') return 0;
  // Antes de list-header: Gap/MD = 8px
  if (nextName === 'list-header') return DS_SPACING.gapSection;
  // inputs en formulario: Gap/LG = 12px
  if (prevName === 'input-text' && nextName === 'input-text') return DS_SPACING.gapForm;
  // filter-bar → contenido: Gap/MD = 8px
  if (prevName === 'filter-bar') return DS_SPACING.gapSection;
  // bloques distintos: Gap/MD = 8px
  return DS_SPACING.gapSection;
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

figma.showUI(__html__, {
  width: 420,
  height: 680,
  title: 'DS IA-Ready Engine',
});

