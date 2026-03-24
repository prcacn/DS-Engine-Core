// DS IA-Ready Engine — Plugin de Registro de Componentes
// Guía al diseñador en 4 pasos para incorporar un componente al DS

var ENGINE_URL    = 'https://ds-ia-ready-engine-production.up.railway.app';
var ENGINE_API_KEY = 'dev-key-local-2025';

// ─── ESTADO GLOBAL ────────────────────────────────────────────────────────────
var state = {
  step:      1,
  component: null,   // datos del nodo seleccionado
  aiData:    null,   // datos generados por IA
  preview:   null,   // preview de los archivos generados
};

// ─── INIT ─────────────────────────────────────────────────────────────────────
figma.showUI(__html__, { width: 400, height: 560, title: 'DS Register' });

figma.ui.onmessage = function(msg) {
  if (msg.type === 'detect')         handleDetect();
  if (msg.type === 'preview')        handlePreview(msg.payload);
  if (msg.type === 'publish')        handlePublish(msg.payload);
  if (msg.type === 'cancel')         figma.closePlugin();
};

// ─── PASO 1: DETECTAR NODO SELECCIONADO ──────────────────────────────────────
async function handleDetect() {
  var sel = figma.currentPage.selection;

  if (!sel || sel.length === 0) {
    figma.ui.postMessage({ type: 'error', text: 'Selecciona un componente en Figma primero.' });
    return;
  }

  var node = sel[0];

  // Escalar hacia arriba hasta encontrar un COMPONENT_SET o COMPONENT
  // El diseñador puede haber seleccionado un texto, frame interno, o variante suelta
  var setNode = null;
  var current = node;
  var maxDepth = 6;
  while (current && maxDepth-- > 0) {
    if (current.type === 'COMPONENT_SET') { setNode = current; break; }
    if (current.type === 'COMPONENT' && current.parent && current.parent.type === 'COMPONENT_SET') {
      setNode = current.parent; break;
    }
    if (current.type === 'COMPONENT' && (!current.parent || current.parent.type !== 'COMPONENT_SET')) {
      setNode = current; break;
    }
    current = current.parent;
  }

  if (!setNode) {
    figma.ui.postMessage({
      type: 'error',
      text: 'No se encontró un COMPONENT_SET en la selección ni en sus padres. Tipo detectado: ' + node.type + '. Asegúrate de seleccionar el componente completo.'
    });
    return;
  }

  if (setNode.id !== node.id) {
    figma.notify('Usando: ' + setNode.name + ' (' + setNode.type + ')');
  }

  // Extraer variantes
  var variants = [];
  if (setNode.type === 'COMPONENT_SET') {
    variants = setNode.children.map(function(v) {
      return {
        name:   v.name,
        nodeId: v.id,
        width:  Math.round(v.width),
        height: Math.round(v.height),
      };
    });
  }

  // Extraer tokens vinculados (boundVariables)
  var tokens = [];
  try {
    var allNodes = setNode.findAll ? setNode.findAll() : [];
    var seen = {};
    allNodes.forEach(function(n) {
      if (n.boundVariables) {
        Object.keys(n.boundVariables).forEach(function(prop) {
          var binding = n.boundVariables[prop];
          var varId = binding && (binding.id || (Array.isArray(binding) && binding[0] && binding[0].id));
          if (varId && !seen[varId]) {
            seen[varId] = true;
            tokens.push({ name: varId, element: n.name, prop: prop });
          }
        });
      }
    });
  } catch(e) {
    console.warn('boundVariables error:', e.message);
  }

  // Extraer propiedades del componentSet
  var properties = [];
  if (setNode.componentPropertyDefinitions) {
    Object.keys(setNode.componentPropertyDefinitions).forEach(function(key) {
      var def = setNode.componentPropertyDefinitions[key];
      properties.push({
        name:         key.replace(/#\w+$/, ''), // quitar sufijo #nodeId
        type:         def.type,
        defaultValue: def.defaultValue,
      });
    });
  }

  // Comprobar si ya existe en el sistema
  var canonicalName = setNode.name.toLowerCase().replace(/\s+/g, '-');

  // Avisar si el nombre parece un componente interno del DS
  var INTERNAL_NAMES = ['title', 'subtitle', 'label', 'icon', 'divider', 'undefined'];
  if (INTERNAL_NAMES.indexOf(canonicalName) !== -1) {
    figma.ui.postMessage({
      type: 'error',
      text: '⚠ "' + canonicalName + '" parece un nodo interno del DS. Selecciona el COMPONENT_SET del componente completo, no un elemento interno.'
    });
    return;
  }

  state.component = {
    name:       canonicalName,
    nodeId:     setNode.id,
    type:       setNode.type,
    width:      Math.round(setNode.width),
    height:     Math.round(setNode.height),
    variants:   variants,
    tokens:     tokens,
    properties: properties,
    figmaName:  setNode.name,
  };

  figma.ui.postMessage({
    type:      'detected',
    component: state.component,
  });
}

// ─── PASO 2: PREVIEW (llamada al engine con preview_only) ────────────────────
async function handlePreview(editedPayload) {
  figma.ui.postMessage({ type: 'loading', text: 'Generando contrato con IA...' });

  var payload = Object.assign({}, state.component, editedPayload, { preview_only: true });

  fetch(ENGINE_URL + '/register', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key':    ENGINE_API_KEY,
    },
    body: JSON.stringify(payload),
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      figma.ui.postMessage({ type: 'error', text: data.message || data.error });
      return;
    }
    state.preview = data;
    state.aiData  = data.aiData;
    figma.ui.postMessage({ type: 'preview-ready', data: data });
  })
  .catch(function(e) {
    figma.ui.postMessage({ type: 'error', text: 'Error de red: ' + e.message });
  });
}

// ─── PASO 3: PUBLICAR (subir a GitHub) ───────────────────────────────────────
async function handlePublish(confirmedPayload) {
  figma.ui.postMessage({ type: 'loading', text: 'Subiendo a GitHub...' });

  var payload = Object.assign({}, state.component, confirmedPayload, { preview_only: false });

  fetch(ENGINE_URL + '/register', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key':    ENGINE_API_KEY,
    },
    body: JSON.stringify(payload),
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      figma.ui.postMessage({ type: 'error', text: data.message || data.error });
      return;
    }
    figma.ui.postMessage({ type: 'published', data: data });
    figma.notify('✓ ' + payload.name + ' registrado en el DS');
  })
  .catch(function(e) {
    figma.ui.postMessage({ type: 'error', text: 'Error de red: ' + e.message });
  });
}
