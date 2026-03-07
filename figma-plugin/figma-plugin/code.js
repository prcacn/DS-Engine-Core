// DS IA-Ready Engine — Figma Plugin V1
// Thin HTTP client. Toda la lógica vive en el Engine (Railway).

var ENGINE_URL = 'https://ds-ia-ready-engine-production.up.railway.app';
var ENGINE_API_KEY = 'dev-key-local-2025';

var COMPONENT_NODE_IDS = {
  'navigation-header':  '1:3',
  'button-primary':     '1:9',
  'button-secondary':   '1:11',
  'card-item':          '1:13',
  'input-text':         '1:21',
  'filter-bar':         '1:24',
  'empty-state':        '1:31',
  'modal-bottom-sheet': '1:36',
};

var HEIGHT_MAP = {
  'navigation-header': 56,
  'filter-bar': 48,
  'card-item': 72,
  'button-primary': 52,
  'button-secondary': 52,
  'input-text': 56,
  'empty-state': 200,
  'modal-bottom-sheet': 300,
};

// ─── MENSAJES DESDE LA UI ────────────────────────────────────────────────────

figma.ui.onmessage = function(msg) {
  if (msg.type === 'generate') {
    handleGenerate(msg.brief, msg.patternOverride);
  }
  if (msg.type === 'ping') {
    handlePing();
  }
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
};

// ─── PING ────────────────────────────────────────────────────────────────────

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

// ─── GENERATE ────────────────────────────────────────────────────────────────

function handleGenerate(brief, patternOverride) {
  figma.ui.postMessage({ type: 'status', text: 'Llamando al engine...' });

  var body = { brief: brief };
  if (patternOverride) { body.pattern = patternOverride; }

  fetch(ENGINE_URL + '/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': ENGINE_API_KEY,
    },
    body: JSON.stringify(body),
  })
  .then(function(res) { return res.json(); })
  .then(function(engineResponse) {
    if (engineResponse.error) {
      figma.ui.postMessage({ type: 'error', text: engineResponse.message || engineResponse.error });
      return;
    }

    var statusText = 'Plan generado (' + engineResponse.status + ') — pintando pantalla...';
    figma.ui.postMessage({ type: 'status', text: statusText });

    return paintScreen(engineResponse);
  })
  .then(function(result) {
    if (!result) return;
    figma.ui.postMessage({
      type: 'success',
      screenId: result.screenId,
      pattern: result.pattern,
      confidence: result.confidence,
      components: result.components,
      nodeId: result.nodeId,
    });
    figma.currentPage.selection = [result.frame];
    figma.viewport.scrollAndZoomIntoView([result.frame]);
  })
  .catch(function(e) {
    figma.ui.postMessage({ type: 'error', text: 'Error: ' + e.message });
  });
}

// ─── PAINT SCREEN ────────────────────────────────────────────────────────────

function paintScreen(engineResponse) {
  var pattern = engineResponse.pattern;
  var components = engineResponse.components;
  var screenId = 'gen_' + Date.now();

  // Posición libre en el canvas
  var existingFrames = figma.currentPage.children;
  var xOffset = 0;
  if (existingFrames.length > 0) {
    var lastFrame = existingFrames[existingFrames.length - 1];
    xOffset = lastFrame.x + lastFrame.width + 80;
  }

  // Frame de pantalla
  var screenFrame = figma.createFrame();
  screenFrame.name = screenId + ' — ' + pattern;
  screenFrame.resize(390, 844);
  screenFrame.x = xOffset;
  screenFrame.y = 0;
  screenFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  screenFrame.clipsContent = true;

  // Ordenar por order
  var sorted = components.slice().sort(function(a, b) { return a.order - b.order; });

  var yPos = 0;
  var paintPromises = sorted.map(function(comp) {
    return paintComponent(screenFrame, comp, yPos).then(function(height) {
      yPos += height;
    });
  });

  return Promise.all(paintPromises).then(function() {
    figma.currentPage.appendChild(screenFrame);

    // Label metadata
    return figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(function() {
      var confidenceGlobal = engineResponse.confidence && engineResponse.confidence.global ? engineResponse.confidence.global : 0;
      var label = figma.createText();
      label.characters = screenId + ' | ' + pattern + ' | ' + engineResponse.status + ' ' + Math.round(confidenceGlobal * 100) + '%';
      label.fontSize = 11;
      label.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
      label.x = screenFrame.x;
      label.y = -24;
      figma.currentPage.appendChild(label);

      return {
        frame: screenFrame,
        nodeId: screenFrame.id,
        screenId: engineResponse.screen_id,
        pattern: pattern,
        confidence: engineResponse.confidence,
        components: components,
      };
    });
  });
}

// ─── PAINT COMPONENT ─────────────────────────────────────────────────────────

function paintComponent(parent, comp, yPos) {
  var nodeId = comp.node_id || COMPONENT_NODE_IDS[comp.component];
  var height = HEIGHT_MAP[comp.component] || 60;

  if (!nodeId) {
    createPlaceholder(parent, comp, yPos, height);
    return Promise.resolve(height);
  }

  return figma.getNodeByIdAsync(nodeId)
    .then(function(node) {
      if (!node) {
        createPlaceholder(parent, comp, yPos, height);
        return height;
      }

      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        var sourceNode = node.type === 'COMPONENT_SET' ? node.defaultVariant || node.children[0] : node;
        if (sourceNode && sourceNode.type === 'COMPONENT') {
          var instance = sourceNode.createInstance();
          instance.x = 0;
          instance.y = yPos;
          instance.resize(390, instance.height);
          parent.appendChild(instance);
          return instance.height;
        }
      }

      createPlaceholder(parent, comp, yPos, height);
      return height;
    })
    .catch(function() {
      createPlaceholder(parent, comp, yPos, height);
      return height;
    });
}

// ─── PLACEHOLDER ─────────────────────────────────────────────────────────────

function createPlaceholder(parent, comp, yPos, height) {
  var rect = figma.createRectangle();
  rect.name = comp.component;
  rect.x = 0;
  rect.y = yPos;
  rect.resize(390, height);
  rect.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.95, b: 0.97 } }];
  rect.cornerRadius = 4;
  parent.appendChild(rect);

  figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).then(function() {
    var text = figma.createText();
    text.characters = comp.component;
    text.fontSize = 12;
    text.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.5 } }];
    text.x = 16;
    text.y = yPos + Math.floor((height - 16) / 2);
    parent.appendChild(text);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 400, height: 560, title: 'DS IA-Ready Engine' });
