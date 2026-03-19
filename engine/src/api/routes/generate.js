// api/routes/generate.js — Fase 3+ con soporte multiscreen (transferencia-bancaria)

const express                  = require('express');
const router                   = express.Router();
const { parseIntent }          = require('../../core/intentParser');
const { calculateScore }       = require('../../core/confidenceScore');
const { loadContracts }        = require('../../loaders/contractLoader');
const { loadPatterns }         = require("../../loaders/patternLoader");
const { runAgents }            = require("../../agents/orchestrator");
const { search: kbSearch }     = require("../../core/knowledgeBase");

const INTENT_TO_PATTERN = {
  'lista-con-filtros':     'lista-con-filtros',
  'formulario-simple':     'formulario-simple',
  'confirmacion':          'confirmacion',
  'detalle':               'detalle',
  'onboarding':            'onboarding',
  'perfil-usuario':        'perfil-usuario',
  'error-estado':          'error-estado',
  'notificaciones':        'notificaciones',
  'transferencia-bancaria':'transferencia-bancaria',
};

// Intents que generan múltiples pantallas en lugar de una sola
const MULTISCREEN_INTENTS = ['transferencia-bancaria'];

// ─── DEFINICIÓN DE FLUJOS MULTIPANTALLA ───────────────────────────────────────
// Cada flujo define sus pantallas en orden fijo.
// Estas pantallas son obligatorias y no se pueden omitir.

const MULTISCREEN_FLOWS = {
  'transferencia-bancaria': [
    {
      screen_number: 1,
      screen_id_suffix: 'origen',
      title: 'Selección de cuenta origen',
      pattern: 'formulario-simple',
      nav_variant: 'with-back',
      nav_title: 'Nueva transferencia',
      required_components: [
        { component: 'navigation-header', variant: 'with-back',  props: { title: 'Nueva transferencia' } },
        { component: 'input-text',        variant: 'select',     props: { label: 'Cuenta de origen' } },
        { component: 'button-primary',    variant: 'default',    props: { label: 'Continuar' } },
      ],
      optional_components: [],
    },
    {
      screen_number: 2,
      screen_id_suffix: 'destino-importe',
      title: 'Destino e importe',
      pattern: 'formulario-simple',
      nav_variant: 'with-back',
      nav_title: 'Destino e importe',
      required_components: [
        { component: 'navigation-header', variant: 'with-back', props: { title: 'Destino e importe' } },
        { component: 'input-text',        variant: 'text',      props: { label: 'IBAN / CLABE', required: true } },
        { component: 'input-text',        variant: 'numeric',   props: { label: 'Importe', required: true } },
        { component: 'button-primary',    variant: 'default',   props: { label: 'Revisar transferencia' } },
      ],
      optional_components: [
        { component: 'input-text',           variant: 'text',    props: { label: 'Concepto', required: false } },
        { component: 'notification-banner',  variant: 'warning', props: { message: 'Comprueba el límite operativo antes de continuar' } },
      ],
    },
    {
      screen_number: 3,
      screen_id_suffix: 'revision',
      title: 'Revisión — obligatoria por normativa',
      pattern: 'detalle',
      nav_variant: 'with-back',
      nav_title: 'Revisa tu transferencia',
      required_components: [
        { component: 'navigation-header', variant: 'with-back', props: { title: 'Revisa tu transferencia' } },
        { component: 'card-item',         variant: 'readonly',  props: { label: 'Cuenta de origen', show_chevron: false }, quantity: 4 },
        { component: 'button-primary',    variant: 'default',   props: { label: 'Confirmar transferencia' } },
        { component: 'button-secondary',  variant: 'default',   props: { label: 'Modificar' } },
      ],
      optional_components: [],
      governance_note: 'Esta pantalla es obligatoria. No se puede omitir aunque el brief lo solicite.',
    },
    {
      screen_number: 4,
      screen_id_suffix: 'confirmacion',
      title: 'Confirmación — punto de no retorno',
      pattern: 'confirmacion',
      nav_variant: 'with-back',
      nav_title: 'Revisa tu transferencia',
      required_components: [
        { component: 'navigation-header',   variant: 'with-back',    props: { title: 'Revisa tu transferencia' } },
        { component: 'modal-bottom-sheet',  variant: 'confirmation', props: { title: 'Confirmar envío', description: 'Esta acción es irreversible' } },
        { component: 'card-item',           variant: 'summary',      props: { show_chevron: false }, quantity: 2 },
        { component: 'button-primary',      variant: 'default',      props: { label: 'Enviar transferencia' } },
        { component: 'button-secondary',    variant: 'default',      props: { label: 'Cancelar' } },
      ],
      optional_components: [],
      governance_note: 'El label del button-primary debe incluir el importe real cuando esté disponible.',
    },
    {
      screen_number: 5,
      screen_id_suffix: 'resultado',
      title: 'Resultado de la operación',
      pattern: 'detalle',
      nav_variant: 'close',
      nav_title: 'Transferencia enviada',
      required_components: [
        { component: 'navigation-header', variant: 'close',   props: { title: 'Transferencia enviada' } },
        { component: 'card-item',         variant: 'success', props: { show_chevron: false }, quantity: 3 },
        { component: 'button-primary',    variant: 'default', props: { label: 'Ir al inicio' } },
      ],
      optional_components: [
        { component: 'notification-banner', variant: 'info',    props: { message: 'La transferencia puede tardar hasta 24h en hacerse efectiva' } },
        { component: 'button-secondary',    variant: 'default', props: { label: 'Nueva transferencia' } },
      ],
    },
  ],
};

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
  const variants = {
    'navigation-header':  function() { return intent.intent_type === 'lista-con-filtros' ? 'default' : 'with-back'; },
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
  if (componentName === 'navigation-header' && intent.domain) {
    props.title = intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1);
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

  patternData.optionalComponents.forEach(function(opt) {
    const contract = contracts[opt.component];
    if (!contract) return;
    let count = 1;
    if (!SINGLETON_COMPONENTS.includes(opt.component) && quantities[opt.component]) {
      count = quantities[opt.component];
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

// ─── RESUMEN DE VIOLACIONES ───────────────────────────────────────────────────
function buildViolationsSummary(briefViolations, components) {
  const violations = [...(briefViolations || []).map(v => ({ ...v, source: 'brief' }))];
  const names = components.map(c => c.component);
  const cardCount  = names.filter(n => n === 'card-item').length;
  const emptyCount = names.filter(n => n === 'empty-state').length;
  if (cardCount > 0 && emptyCount > 0) {
    violations.push({ source: 'composition', rule: 'card-empty-exclusivity', detail: 'card-item y empty-state coexisten en el plan final.', severity: 'error', action: 'Revisar manualmente antes de entregar' });
  }
  const primaryCount = names.filter(n => n === 'button-primary').length;
  if (primaryCount > 1) {
    violations.push({ source: 'composition', rule: 'max-1-button-primary', detail: 'El plan final contiene ' + primaryCount + ' button-primary. Solo se permite 1.', severity: 'error', action: 'Revisar manualmente antes de entregar' });
  }
  const navCount = names.filter(n => n === 'navigation-header').length;
  if (navCount > 1) {
    violations.push({ source: 'composition', rule: 'max-1-navigation-header', detail: 'El plan final contiene ' + navCount + ' navigation-header. Solo se permite 1.', severity: 'error', action: 'Revisar manualmente antes de entregar' });
  }
  return violations;
}

// ─── SUSTITUCIÓN FINANCIERA ────────────────────────────────────────────────
function applyFinancialVariant(components, intent, brief) {
  const b = brief.toLowerCase();
  const financialKeywords = ["movimiento", "transaccion", "transferencia", "pago", "ingreso", "gasto", "extracto", "cargo", "abono"];
  const isFinancial = financialKeywords.some(k => b.includes(k));
  if (!isFinancial) return components;
  return components.map(c => {
    if (c.component !== "card-item") return c;
    const contracts = loadContracts();
    const financialContract = contracts["card-item/financial"];
    if (!financialContract) return c;
    return { ...c, component: "card-item/financial", node_id: financialContract.nodeId };
  });
}

// ─── ROUTER ───────────────────────────────────────────────────────────────────
router.post('/', async function(req, res, next) {
  try {
    const brief = req.body.brief;
    const forcedPattern = req.body.pattern;

    if (!brief || !brief.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    }

    console.log('  → Generando para brief: "' + brief.substring(0, 80) + '"');

    const quantities = extractQuantities(brief);
    if (Object.keys(quantities).length > 0) {
      console.log('  → Cantidades detectadas:', JSON.stringify(quantities));
    }

    const contracts = loadContracts();
    const patterns  = loadPatterns();

    const intent = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: { is_multiscreen_flow: MULTISCREEN_INTENTS.includes(forcedPattern) }, reasoning: 'Pattern forzado', brief_violations: [] }
      : await parseIntent(brief);

    const patternName = INTENT_TO_PATTERN[intent.intent_type] || 'lista-con-filtros';

    // ── FLUJO MULTIPANTALLA ────────────────────────────────────────────────────
    if (MULTISCREEN_INTENTS.includes(intent.intent_type)) {
      const flowDef = MULTISCREEN_FLOWS[intent.intent_type];
      if (!flowDef) {
        return res.status(404).json({ error: 'FlowNotFound', message: "Flujo multipantalla '" + intent.intent_type + "' no tiene definición en MULTISCREEN_FLOWS" });
      }

      const screens = buildMultiscreenFlow(brief, intent, flowDef, contracts);
      const screenId = 'flow_' + Date.now();

      console.log('  ✓ Flujo multipantalla generado: ' + screens.length + ' pantallas para intent: ' + intent.intent_type);

      return res.json({
        screen_id:    screenId,
        brief:        brief.trim(),
        pattern:      patternName,
        flow_type:    'multiscreen',
        total_screens: screens.length,
        intent,
        status:       'AUTO_APPROVE',
        confidence: {
          global: 0.90,
          status: 'AUTO_APPROVE',
          signals: {
            contract_coverage: 0.90,
            precedent: 0.85,
            intent_clarity: intent.confidence,
            rule_compliance: 1.0,
          }
        },
        violations:   intent.brief_violations || [],
        screens:      screens,
        meta: {
          engine_version: '1.0.0',
          phase: 'Fase 3+ — Multiscreen Flow Support',
          generated_at: new Date().toISOString()
        }
      });
    }

    // ── FLUJO ESTÁNDAR (pantalla única) ────────────────────────────────────────
    const patternData = patterns[patternName];
    if (!patternData) {
      return res.status(404).json({ error: 'PatternNotFound', message: "Pattern '" + patternName + "' no encontrado" });
    }

    const rawResult = buildCompositionPlan(brief, intent, patternData, contracts);
    const rawComponents = rawResult.components;
    const compositionRules = rawResult.compositionRules;
    // ── AGENTES (UXWriter + UXSpec en paralelo) ──────────────────────────
    const kbRules = await kbSearch(brief, { topK: 5, minScore: 0.65 }).catch(() => []);
    const agentResult = await runAgents({ brief, components: rawComponents, intent, kbRules, contracts });
    const enrichedComponents = agentResult.components;
    const agentMeta = agentResult.agent_meta;

    const financialComponents = applyFinancialVariant(enrichedComponents, intent, brief);
    const components = reorderComponents(resolveExclusivity(financialComponents, brief));
    const confidence = calculateScore({ pattern: patternName, components, intent, contracts: Object.values(contracts) });
    const violations = buildViolationsSummary(intent.brief_violations || [], components);
    const screenId = 'gen_' + Date.now();

    console.log('  ✓ Plan generado: ' + components.length + ' componentes, status: ' + confidence.status);

    res.json({
      screen_id:         screenId,
      brief:             brief.trim(),
      pattern:           patternName,
      flow_type:         'single',
      intent,
      status:            confidence.status,
      confidence,
      violations,
      components,
      composition_rules: compositionRules,
      agent_meta: agentMeta,
      meta: { engine_version: '1.0.0', phase: 'Fase 3+ — Quantity Parsing', generated_at: new Date().toISOString() }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
