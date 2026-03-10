// api/routes/generate.js — Fase 4 (KB con reglas catalogadas)
const express  = require('express');
const router   = express.Router();
const { parseIntent }    = require('../../core/intentParser');
const { calculateScore } = require('../../core/confidenceScore');
const { loadContracts }  = require('../../loaders/contractLoader');
const { loadPatterns }   = require('../../loaders/patternLoader');
const kb = require('../../core/knowledgeBase');

const INTENT_TO_PATTERN = {
  'lista-con-filtros': 'lista-con-filtros',
  'formulario-simple': 'formulario-simple',
  'confirmacion':      'confirmacion',
  'detalle':           'detalle',
  'onboarding':        'onboarding',
  'perfil-usuario':    'perfil-usuario',
  'error-estado':      'error-estado',
  'notificaciones':    'notificaciones',
};

// ─── KB: Buscar y devolver contexto + reglas completas ────────────────────────
async function enrichBriefWithKnowledge(brief) {
  try {
    const results = await kb.search(brief, { topK: 4 });
    if (results.length === 0) return { context: '', rules: [] };
    const context = results
      .map(r => `[${r.tipo} · ${r.geografia}] ${r.content}`)
      .join('\n');
    console.log('  → KB: ' + results.length + ' reglas encontradas');
    return { context, rules: results };
  } catch (error) {
    console.warn('  ⚠ KB no disponible:', error.message);
    return { context: '', rules: [] };
  }
}

function extractQuantities(brief) {
  const b = brief.toLowerCase();
  const quantities = {};
  const WORD_TO_NUM = { 'un':1,'una':1,'uno':1,'dos':2,'tres':3,'cuatro':4,'cinco':5,'seis':6,'siete':7,'ocho':8,'nueve':9,'diez':10 };
  const TERM_TO_COMPONENT = {
    'card item':'card-item','card items':'card-item','cards':'card-item','card':'card-item','tarjeta':'card-item','tarjetas':'card-item','elemento':'card-item','elementos':'card-item',
    'filtro':'filter-bar','filtros':'filter-bar','filter':'filter-bar','filters':'filter-bar',
    'botón primario':'button-primary','botones primarios':'button-primary','button primary':'button-primary',
    'input':'input-text','inputs':'input-text','campo':'input-text','campos':'input-text',
    'notificación':'notification-banner','notificaciones':'notification-banner','alerta':'notification-banner','alertas':'notification-banner','banner':'notification-banner',
    'tab':'tab-bar','tabs':'tab-bar',
    'sección':'list-header','secciones':'list-header',
    'badge':'badge','chip':'badge','chips':'badge','etiqueta':'badge','etiquetas':'badge',
  };
  const numPattern = '(\\d+|' + Object.keys(WORD_TO_NUM).join('|') + ')';
  const termPattern = Object.keys(TERM_TO_COMPONENT).map(t => t.replace(/ /g, '\\s+')).join('|');
  const regex = new RegExp(numPattern + '\\s+(' + termPattern + ')', 'gi');
  let match;
  while ((match = regex.exec(b)) !== null) {
    const rawNum  = match[1].toLowerCase();
    const rawTerm = match[2].toLowerCase().replace(/\s+/g, ' ');
    const num = WORD_TO_NUM[rawNum] || parseInt(rawNum, 10) || 1;
    for (const term of Object.keys(TERM_TO_COMPONENT)) {
      if (rawTerm.replace(/\s+/g, ' ').includes(term)) {
        quantities[TERM_TO_COMPONENT[term]] = Math.max(quantities[TERM_TO_COMPONENT[term]] || 0, num);
        break;
      }
    }
  }
  return quantities;
}

function resolveVariant(component, intent) {
  const variants = {
    'navigation-header':  function() { return ['detalle','formulario-simple','confirmacion'].includes(intent.intent_type) ? 'with-back' : 'default'; },
    'modal-bottom-sheet': function() { return (intent.constraints && intent.constraints.is_destructive) || intent.intent_type === 'confirmacion' ? 'confirmation' : 'default'; },
    'filter-bar':         function() { return 'chips'; },
  };
  return variants[component] ? variants[component]() : 'default';
}

function buildSmartProps(contract, intent, componentName) {
  const props = {};
  contract.properties.forEach(function(p) { if (p.default && p.default !== '""') props[p.name] = p.default.replace(/"/g, ''); });
  if (componentName === 'navigation-header' && intent.domain) { props.title = intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1); }
  if (componentName === 'empty-state' && intent.constraints && intent.constraints.has_filters) { props.action_label = 'Limpiar filtros'; props.illustration = 'no-results'; }
  if (componentName === 'button-primary' && intent.constraints && intent.constraints.is_destructive) { props.label = 'Confirmar'; }
  return props;
}

function resolveOptional(component, intent, brief) {
  const b = brief.toLowerCase();
  const rules = {
    'button-primary':     function() { return { include: intent.intent_type === 'lista-con-filtros' && (b.includes('crear') || b.includes('nuevo') || b.includes('añadir')), confidence: 0.75 }; },
    'modal-bottom-sheet': function() { return { include: (intent.constraints && intent.constraints.needs_confirmation) || (intent.constraints && intent.constraints.is_destructive), confidence: 0.85 }; },
    'button-secondary':   function() { return { include: intent.intent_type === 'confirmacion' || (intent.constraints && intent.constraints.needs_confirmation), confidence: 0.90 }; },
    'card-item':          function() { return { include: intent.intent_type === 'confirmacion', confidence: 0.75 }; },
    'tab-bar':            function() { return { include: ['lista-con-filtros','detalle','perfil-usuario','notificaciones'].includes(intent.intent_type), confidence: 0.85 }; },
    'notification-banner':function() { return { include: intent.intent_type === 'notificaciones' || b.includes('notificacion') || b.includes('alerta'), confidence: 0.80 }; },
    'list-header':        function() { return { include: ['perfil-usuario','notificaciones','lista-con-filtros'].includes(intent.intent_type), confidence: 0.75 }; },
    'badge':              function() { return { include: b.includes('badge') || b.includes('estado') || b.includes('variacion') || b.includes('precio'), confidence: 0.70 }; },
  };
  return rules[component] ? rules[component]() : { include: false, confidence: 0 };
}

function buildCompositionPlan(brief, intent, patternData, contracts) {
  const components = [];
  const quantities = extractQuantities(brief);
  const SINGLETON_COMPONENTS = ['navigation-header','filter-bar','modal-bottom-sheet','tab-bar'];
  let order = 1;

  patternData.requiredComponents.forEach(function(req) {
    const contract = contracts[req.component];
    if (!contract) return;
    let count = 1;
    if (!SINGLETON_COMPONENTS.includes(req.component) && quantities[req.component]) { count = quantities[req.component]; }
    for (let i = 0; i < count; i++) {
      components.push({ slot: req.component + (count > 1 ? '_' + (i+1) : ''), component: req.component, order: order++, required: true, variant: resolveVariant(req.component, intent), props: buildSmartProps(contract, intent, req.component), node_id: contract.nodeId, resolution_confidence: 0.85, quantity_index: count > 1 ? (i+1) : null });
    }
  });

  patternData.optionalComponents.forEach(function(opt) {
    const contract = contracts[opt.component];
    if (!contract) return;
    let count = 1;
    if (!SINGLETON_COMPONENTS.includes(opt.component) && quantities[opt.component]) { count = quantities[opt.component]; }
    const r = resolveOptional(opt.component, intent, brief);
    const include = r.include || (quantities[opt.component] && quantities[opt.component] > 0);
    if (include) {
      for (let i = 0; i < count; i++) {
        components.push({ slot: opt.component + (count > 1 ? '_' + (i+1) : ''), component: opt.component, order: order++, required: false, variant: resolveVariant(opt.component, intent), props: buildSmartProps(contract, intent, opt.component), node_id: contract.nodeId, resolution_confidence: r.confidence || 0.85, quantity_index: count > 1 ? (i+1) : null });
      }
    }
  });

  return { components, compositionRules: patternData.compositionRules };
}

function resolveExclusivity(components, brief) {
  const briefLower = brief.toLowerCase();
  const hasExplicitEmpty = briefLower.includes('vacío') || briefLower.includes('vacio') || briefLower.includes('sin resultados') || briefLower.includes('sin datos') || briefLower.includes('empty');
  const hasCardItem  = components.some(c => c.component === 'card-item');
  const hasEmptyState = components.some(c => c.component === 'empty-state');
  if (hasCardItem && hasEmptyState) {
    return hasExplicitEmpty ? components.filter(c => c.component !== 'card-item') : components.filter(c => c.component !== 'empty-state');
  }
  return components;
}

function reorderComponents(components) {
  return components.sort((a, b) => a.order - b.order).map((c, i) => Object.assign({}, c, { order: i + 1 }));
}

function buildViolationsSummary(intentViolations, components) {
  const violations = [];
  if (intentViolations && intentViolations.length > 0) {
    intentViolations.forEach(v => violations.push({ source: 'brief', rule: v.rule, detail: v.detail, severity: v.severity, action: 'El engine ha ignorado esta parte del brief para mantener la gobernanza del DS' }));
  }
  const names = components.map(c => c.component);
  if (names.filter(n => n === 'button-primary').length > 1) { violations.push({ source: 'composition', rule: 'max-1-button-primary', detail: 'Solo se permite 1 button-primary.', severity: 'error', action: 'Revisar manualmente' }); }
  if (names.filter(n => n === 'navigation-header').length > 1) { violations.push({ source: 'composition', rule: 'max-1-navigation-header', detail: 'Solo se permite 1 navigation-header.', severity: 'error', action: 'Revisar manualmente' }); }
  return violations;
}

router.post('/', async function(req, res, next) {
  try {
    const brief         = req.body.brief;
    const forcedPattern = req.body.pattern;
    if (!brief || !brief.trim()) return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });

    console.log('  → Brief: "' + brief.substring(0, 80) + '"');

    // ── KB ────────────────────────────────────────────────────────────────────
    const kbResult  = await enrichBriefWithKnowledge(brief);
    const kbContext = kbResult.context;
    const kbRules   = kbResult.rules;
    const enrichedBrief = kbContext ? `${brief}\n\n[Contexto organizacional:\n${kbContext}]` : brief;

    const contracts   = loadContracts();
    const patterns    = loadPatterns();
    const intent      = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: {}, reasoning: 'Pattern forzado', brief_violations: [] }
      : await parseIntent(enrichedBrief);

    const patternName = INTENT_TO_PATTERN[intent.intent_type] || 'lista-con-filtros';
    const patternData = patterns[patternName];
    if (!patternData) return res.status(404).json({ error: 'PatternNotFound', message: "Pattern '" + patternName + "' no encontrado" });

    const rawResult    = buildCompositionPlan(brief, intent, patternData, contracts);
    const components   = reorderComponents(resolveExclusivity(rawResult.components, brief));
    const confidence   = calculateScore({ pattern: patternName, components, intent, contracts: Object.values(contracts) });
    const violations   = buildViolationsSummary(intent.brief_violations || [], components);
    const screenId     = 'gen_' + Date.now();

    console.log('  ✓ ' + components.length + ' componentes | ' + confidence.status + ' | KB: ' + (kbRules.length > 0 ? kbRules.length + ' reglas' : 'sin contexto'));

    res.json({
      screen_id:        screenId,
      brief:            brief.trim(),
      pattern:          patternName,
      intent,
      status:           confidence.status,
      confidence,
      violations,
      components,
      composition_rules:rawResult.compositionRules,
      kb_context_used:  kbRules.length > 0,
      kb_rules:         kbRules,
      meta: { engine_version: '1.0.0', phase: 'Fase 4 — Knowledge Base', generated_at: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
