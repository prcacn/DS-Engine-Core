// core/compositionBuilder.js
// Construye el plan de composición de componentes a partir del patrón e intent.
// Incluye resolución de variantes, props, opcionales y reordenamiento.

const { getNavLevel, getHeaderVariant, getHeaderNodeId } = require('./globalRulesParser');

// ─── PARSEAR CANTIDADES DEL BRIEF ─────────────────────────────────────────────
function extractQuantities(brief) {
  const b = brief.toLowerCase();
  const quantities = {};

  const WORD_TO_NUM = {
    'un': 1, 'una': 1, 'uno': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
  };

  const TERM_TO_COMPONENT = {
    'card item': 'card-item', 'card items': 'card-item', 'cards': 'card-item',
    'card': 'card-item', 'tarjeta': 'card-item', 'tarjetas': 'card-item',
    'elemento': 'card-item', 'elementos': 'card-item',
    'filtro': 'filter-bar', 'filtros': 'filter-bar',
    'botón primario': 'button-primary', 'botones primarios': 'button-primary',
    'input': 'input-text', 'inputs': 'input-text', 'campo': 'input-text', 'campos': 'input-text',
    'notificación': 'notification-banner', 'notificaciones': 'notification-banner',
    'banner': 'notification-banner', 'badge': 'badge', 'chip': 'badge', 'chips': 'badge',
    'sección': 'list-header', 'secciones': 'list-header',
  };

  const numPattern = Object.keys(WORD_TO_NUM).join('|');
  const termPattern = Object.keys(TERM_TO_COMPONENT).sort((a, b) => b.length - a.length).join('|');
  const regex = new RegExp('(\\d+|' + numPattern + ')\\s+(' + termPattern + ')', 'gi');

  let match;
  while ((match = regex.exec(b)) !== null) {
    const rawNum = match[1].toLowerCase();
    const rawTerm = match[2].toLowerCase();
    const num = parseInt(rawNum) || WORD_TO_NUM[rawNum] || 1;
    const component = TERM_TO_COMPONENT[rawTerm];
    if (component) quantities[component] = Math.max(quantities[component] || 0, num);
  }

  return quantities;
}

// ─── RESOLVER VARIANTE DE COMPONENTE ─────────────────────────────────────────
function resolveVariant(component, intent) {
  // navigation-header: usa el header_variant del intent si viene del intentParser
  // Si no, infiere desde navigation_level o INTENT_TO_LEVEL
  // Nombres alineados con Figma: Type=Dashboard | Type=Predeterminada | Type=Modal
  // Nivel leído de global-rules/navigation.md via parser — no hardcodeado
  const navLevel = intent.navigation_level || getNavLevel(intent.intent_type);
  const variants = {
    'navigation-header':  function() {
      // Prioridad: intent.header_variant (intentParser) > getHeaderVariant (parser) > fallback
      if (intent.header_variant) return intent.header_variant;
      return getHeaderVariant(navLevel) || 'Type=Predeterminada';
    },
    'button-primary':     function() { return intent.constraints && intent.constraints.is_destructive ? 'destructive' : 'default'; },
    'empty-state':        function() { return intent.constraints && intent.constraints.has_filters ? 'no-results' : 'default'; },
    'modal-bottom-sheet': function() { return (intent.constraints && intent.constraints.is_destructive) || intent.intent_type === 'confirmacion' ? 'confirmation' : 'default'; },
    'filter-bar':         function() { return 'chips'; },
  };
  return variants[component] ? variants[component]() : 'default';
}

// ─── CONSTRUIR PROPS SMART ────────────────────────────────────────────────────
function buildSmartProps(contract, intent, componentName) {
  const props = {};
  contract.properties.forEach(function(p) {
    if (p.default && p.default !== '""') props[p.name] = p.default.replace(/"/g, '');
  });
  if (componentName === 'navigation-header') {
    // Título desde el dominio
    if (intent.domain) {
      props.title = intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1);
    }
    // node_id leído de global-rules/navigation.md via parser — no hardcodeado
    const navLevel2        = intent.navigation_level || getNavLevel(intent.intent_type);
    const resolvedVariant  = intent.header_variant || getHeaderVariant(navLevel2);
    props._variant_node_id = getHeaderNodeId(resolvedVariant);
    props._figma_variant   = resolvedVariant;
  }
  if (componentName === 'empty-state' && intent.constraints && intent.constraints.has_filters) {
    props.action_label = 'Limpiar filtros';
    props.illustration = 'no-results';
  }
  if (componentName === 'button-primary' && intent.constraints && intent.constraints.is_destructive) {
    props.label = 'Confirmar';
  }
  return props;
}

// ─── RESOLVER OPCIONALES ─────────────────────────────────────────────────────
function resolveOptional(component, intent, brief) {
  const b = brief.toLowerCase();
  const rules = {
    'button-primary':     function() { return { include: intent.intent_type === 'lista-con-filtros' && (b.includes('crear') || b.includes('nuevo') || b.includes('añadir')), confidence: 0.75 }; },
    'modal-bottom-sheet': function() { return { include: (intent.constraints && intent.constraints.needs_confirmation) || (intent.constraints && intent.constraints.is_destructive), confidence: 0.85 }; },
    'button-secondary':   function() { return { include: intent.intent_type === 'confirmacion' || (intent.constraints && intent.constraints.needs_confirmation), confidence: 0.90 }; },
    'card-summary': function() {
      return { include: intent.intent_type === 'dashboard' && isFintechDomain(brief, intent), confidence: 0.90 };
    },
    'card-item/account': function() {
      const b = brief.toLowerCase();
      return { include: b.includes('cuenta') || b.includes('cuentas') || b.includes('cuenta bancaria'), confidence: 0.85 };
    },
    // C1: tab-bar obligatorio en L0 (dashboard, onboarding autenticado) y L1 (listas raíz)
    // El engine infiere esto del nivel de navegación — el diseñador no necesita pedirlo
    'tab-bar': function() {
      const level = INTENT_TO_LEVEL[intent.intent_type] || 'L2';
      const L0_intents = ['dashboard'];
      const L1_intents = ['lista-con-filtros', 'notificaciones', 'perfil-usuario'];
      const include = L0_intents.includes(intent.intent_type) || L1_intents.includes(intent.intent_type);
      return { include, confidence: include ? 0.95 : 0 };
    },
    'card-item':          function() { return { include: intent.intent_type === 'confirmacion', confidence: 0.75 }; },
  };
  return rules[component] ? rules[component]() : { include: false, confidence: 0 };
}

// ─── REORDENAR COMPONENTES ────────────────────────────────────────────────────
function reorderComponents(components) {
  const ORDER = ['navigation-header', 'notification-banner', 'list-header', 'filter-bar',
    'tab-bar', 'card-item', 'empty-state', 'input-text', 'modal-bottom-sheet',
    'button-secondary', 'button-primary', 'badge'];
  return [...components].sort((a, b) => {
    const ai = ORDER.indexOf(a.component);
    const bi = ORDER.indexOf(b.component);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

// ─── RESOLVER EXCLUSIVIDAD ────────────────────────────────────────────────────
function resolveExclusivity(components, brief) {
  const b = brief.toLowerCase();
  const hasEmpty = components.some(c => c.component === 'empty-state');
  const hasCard  = components.some(c => c.component === 'card-item');
  if (hasEmpty && hasCard) {
    return b.includes('vacío') || b.includes('sin resultados')
      ? components.filter(c => c.component !== 'card-item')
      : components.filter(c => c.component !== 'empty-state');
  }
  return components;
}

// ─── BUILD COMPOSITION PLAN (pantalla única) ──────────────────────────────────
function buildCompositionPlan(brief, intent, patternData, contracts) {
  const components = [];
  const quantities = extractQuantities(brief);
  const SINGLETON_COMPONENTS = ['navigation-header', 'filter-bar', 'modal-bottom-sheet', 'tab-bar'];
  let order = 1;

  patternData.requiredComponents.forEach(function(req) {
    const contract = contracts[req.component];
    if (!contract) return;
    let count = 1;
    if (!SINGLETON_COMPONENTS.includes(req.component) && quantities[req.component]) {
      count = quantities[req.component];
    }
    for (let i = 0; i < count; i++) {
      components.push({
        slot:      req.component + (count > 1 ? '_' + (i + 1) : ''),
        component: req.component,
        order:     order++,
        required:  true,
        variant:   resolveVariant(req.component, intent),
        props:     buildSmartProps(contract, intent, req.component),
        node_id:   contract.nodeId,
        resolution_confidence: 0.85,
        quantity_index: count > 1 ? (i + 1) : null,
      });
    }
  });

  // A3: detectar si hay modal en requeridos para excluir botones del fondo
  const modalInRequired = components.some(c => c.component === "modal-bottom-sheet");

  patternData.optionalComponents.forEach(function(opt) {
    const contract = contracts[opt.component];
    if (!contract) return;
    let count = 1;
    if (!SINGLETON_COMPONENTS.includes(opt.component) && quantities[opt.component]) {
      count = quantities[opt.component];
    }
    // A3: si hay modal, excluir button-primary y button-secondary del fondo
    // La lógica estaba hardcodeada en el renderer — ahora vive en el plan de composición
    if (modalInRequired && (opt.component === "button-primary" || opt.component === "button-secondary")) {
      console.log("  → [A3] Excluyendo " + opt.component + " del fondo — modal-bottom-sheet presente");
      return;
    }
    const r = resolveOptional(opt.component, intent, brief);
    const include = r.include || (quantities[opt.component] && quantities[opt.component] > 0);
    if (include) {
      for (let i = 0; i < count; i++) {
        components.push({
          slot:      opt.component + (count > 1 ? '_' + (i + 1) : ''),
          component: opt.component,
          order:     order++,
          required:  false,
          variant:   resolveVariant(opt.component, intent),
          props:     buildSmartProps(contract, intent, opt.component),
          node_id:   contract.nodeId,
          resolution_confidence: r.confidence || 0.85,
          quantity_index: count > 1 ? (i + 1) : null,
        });
      }
    }
  });

  return { components, compositionRules: patternData.compositionRules || [] };
}

// ─── BUILD MULTISCREEN FLOW ───────────────────────────────────────────────────
// Para intents como transferencia-bancaria que generan N pantallas fijas
function buildMultiscreenFlow(brief, intent, flowDef, contracts) {
  const screens = flowDef.map(function(screenDef) {
    const components = [];
    let order = 1;

    screenDef.required_components.forEach(function(req) {
      const count = req.quantity || 1;
      for (let i = 0; i < count; i++) {
        const contract = contracts[req.component];
        components.push({
          slot:      req.component + (count > 1 ? '_' + (i + 1) : ''),
          component: req.component,
          order:     order++,
          required:  true,
          variant:   req.variant || 'default',
          props:     req.props || {},
          node_id:   contract ? contract.nodeId : 'pending',
          resolution_confidence: 0.90,
          quantity_index: count > 1 ? (i + 1) : null,
        });
      }
    });

    return {
      screen_number:    screenDef.screen_number,
      screen_id:        'gen_' + Date.now() + '_' + screenDef.screen_id_suffix,
      screen_title:     screenDef.title,
      pattern:          screenDef.pattern,
      governance_note:  screenDef.governance_note || null,
      components:       components,
    };
  });

  return screens;
}



// ─── BUILD VIOLATIONS SUMMARY ────────────────────────────────────────────────
function buildViolationsSummary(briefViolations, components) {
  const violations = [];

  // Añadir violaciones del brief
  (briefViolations || []).forEach(function(v) {
    violations.push({
      source: 'brief',
      rule:   v.rule,
      detail: v.detail,
      severity: v.severity,
      action: 'Revisar el brief y corregir la solicitud',
    });
  });

  // Validaciones de composición
  const names = (components || []).map(function(c) { return c.component; });

  const btnCount = names.filter(function(n) { return n === 'button-primary'; }).length;
  if (btnCount > 1) {
    violations.push({ source: 'composition', rule: 'max-1-button-primary', detail: 'El plan final contiene ' + btnCount + ' button-primary. Solo se permite 1.', severity: 'error', action: 'Revisar manualmente antes de entregar' });
  }

  const navCount = names.filter(function(n) { return n === 'navigation-header'; }).length;
  if (navCount > 1) {
    violations.push({ source: 'composition', rule: 'max-1-navigation-header', detail: 'El plan final contiene ' + navCount + ' navigation-header. Solo se permite 1.', severity: 'error', action: 'Revisar manualmente antes de entregar' });
  }

  return violations;
}

module.exports = {
  buildCompositionPlan,
  buildMultiscreenFlow,
  buildViolationsSummary,
  resolveVariant,
  reorderComponents,
  resolveExclusivity,
  extractQuantities,
};
