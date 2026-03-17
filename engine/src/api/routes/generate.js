// api/routes/generate.js — Fase 4 (KB con reglas catalogadas)
const express  = require('express');
const router   = express.Router();
const { parseIntent }    = require('../../core/intentParser');
const { calculateScore } = require('../../core/confidenceScore');
const { loadContracts }  = require('../../loaders/contractLoader');
const { loadPatterns }   = require('../../loaders/patternLoader');
const kb = require('../../core/knowledgeBase');
const { runAgents } = require('../../agents/orchestrator');

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
      components.push({ slot: req.component + (count > 1 ? '_' + (i+1) : ''), component: req.component, order: order++, required: true, variant: resolveVariant(req.component, intent), props: buildSmartProps(contract, intent, req.component), node_id: req.node_id || contract.nodeId, resolution_confidence: 0.85, quantity_index: count > 1 ? (i+1) : null });
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
  // Reglas de posición fija — independiente del orden que devuelvan los agentes
  const POSITION_TOP    = ['navigation-header'];                    // siempre primero
  const POSITION_BOTTOM = ['tab-bar', 'button-primary', 'button-secondary', 'modal-bottom-sheet']; // siempre al final

  const top    = components.filter(c => POSITION_TOP.includes(c.component));
  const bottom = components.filter(c => POSITION_BOTTOM.includes(c.component));
  const middle = components.filter(c => !POSITION_TOP.includes(c.component) && !POSITION_BOTTOM.includes(c.component));

  // Ordenar cada grupo por su order original (respeta la lógica de los agentes dentro de cada zona)
  const sorted = [
    ...top.sort((a, b) => a.order - b.order),
    ...middle.sort((a, b) => a.order - b.order),
    ...bottom.sort((a, b) => a.order - b.order),
  ];

  return sorted.map((c, i) => Object.assign({}, c, { order: i + 1 }));
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

// ─── KB RULES ENGINE ──────────────────────────────────────────────────────────
// Aplica las reglas KB sobre los componentes generados y devuelve
// los componentes modificados + un log explicado de cada cambio.

const KB_COMPONENT_KEYWORDS = {
  'fondos':           ['card-item', 'list-header', 'filter-bar'],
  'inversión':        ['card-item', 'list-header', 'filter-bar'],
  'inversion':        ['card-item', 'list-header', 'filter-bar'],
  'perfil de riesgo': ['card-item'],
  'login':            ['input-text', 'button-primary'],
  'formulario':       ['input-text', 'button-primary'],
  'notificación':     ['notification-banner'],
  'notificacion':     ['notification-banner'],
  'transacción':      ['card-item', 'list-header'],
  'transaccion':      ['card-item', 'list-header'],
  'dashboard':        ['card-item', 'list-header'],
  'kyc':              ['input-text', 'button-primary'],
  'onboarding':       ['button-primary'],
};

const KB_REPLACEMENT_COMPONENTS = {
  // NOTA: 'card-item' → 'empty-state' eliminado intencionalmente.
  // Era demasiado agresivo: reemplazaba card-items válidos por empty-state
  // cuando una regla KB mencionaba restricciones de acceso.
  // El empty-state solo debe aparecer si intent_type es 'error-estado'
  // o si el brief lo pide explícitamente.
  'list-header':  { component: 'notification-banner', variant: 'warning', label: 'Banner de aviso' },
  'filter-bar':   { component: 'notification-banner', variant: 'warning', label: 'Banner de aviso' },
};

function applyKBRules(components, kbRules, contracts, intent) {
  if (!kbRules || kbRules.length === 0) return { components, kb_changes: [] };

  const intentGeo = (intent?.constraints?.geography || '').toLowerCase(); // ej: 'colombia', ''

  // ── FILTRO DE GEOGRAFÍA ──────────────────────────────────────────────────
  // Si una regla menciona "solo en [país]" pero el intent no es de ese país,
  // la ignoramos para no contaminar briefs genéricos.
  const GEO_MARKERS = [
    { marker: 'solo en colombia', geo: 'colombia' },
    { marker: 'solo en méxico',   geo: 'mexico'   },
    { marker: 'solo en mexico',   geo: 'mexico'   },
    { marker: 'solo en españa',   geo: 'spain'    },
    { marker: 'solo en spain',    geo: 'spain'    },
    { marker: 'geography=colombia', geo: 'colombia' },
    { marker: 'geography=mexico',   geo: 'mexico'   },
  ];

  const filteredRules = kbRules.filter(function(rule) {
    const ruleText = (rule.content || '').toLowerCase();
    for (const { marker, geo } of GEO_MARKERS) {
      if (ruleText.includes(marker)) {
        // La regla es geográfica — solo aplica si el intent coincide
        return intentGeo === geo;
      }
    }
    return true; // regla sin marcador geográfico → siempre aplica
  });

  if (filteredRules.length < kbRules.length) {
    console.log('  → KB: ' + (kbRules.length - filteredRules.length) + ' regla(s) filtrada(s) por geografía (intent.geo=' + (intentGeo || 'null') + ')');
  }

  let result    = [...components];
  const changes = [];
  const PRIORITY = { alta: 3, media: 2, baja: 1 };
  const sorted  = [...filteredRules].sort((a, b) => (PRIORITY[b.prioridad] || 0) - (PRIORITY[a.prioridad] || 0));

  sorted.forEach(function(rule) {
    const cat  = rule.categoria || 'recomendacion';
    const pri  = rule.prioridad || 'media';
    const text = (rule.content || '').toLowerCase();

    // ── UMBRAL DE SCORE ──────────────────────────────────────────────────────
    // Las reglas con score bajo (similitud semántica débil) no deben aplicarse
    // aunque estén en el contexto KB — evita falsos positivos en briefs genéricos
    const MIN_SCORE_RESTRICCION  = 0.82; // restricciones solo con alta confianza
    const MIN_SCORE_RECOMENDACION = 0.78;
    const ruleScore = rule.score || 0;

    if (cat === 'restriccion' && ruleScore < MIN_SCORE_RESTRICCION) {
      console.log('  → KB: regla ' + (rule.id || '') + ' ignorada (score=' + ruleScore.toFixed(3) + ' < ' + MIN_SCORE_RESTRICCION + ')');
      return;
    }
    if (cat === 'recomendacion' && ruleScore < MIN_SCORE_RECOMENDACION) {
      return;
    }

    // Detectar qué componentes afecta esta regla por palabras clave
    const affected = new Set();
    Object.entries(KB_COMPONENT_KEYWORDS).forEach(([kw, comps]) => {
      if (text.includes(kw)) comps.forEach(c => affected.add(c));
    });

    // Regla genérica sin componentes detectados → solo normativas añaden banner
    if (affected.size === 0) {
      if (cat === 'normativa' && !result.some(c => c.component === 'notification-banner') && contracts['notification-banner']) {
        const maxOrder = Math.max(...result.map(c => c.order), 0);
        result.push({ slot: 'notification-banner', component: 'notification-banner', order: maxOrder + 1, required: true, variant: 'info', props: { text: rule.content }, node_id: contracts['notification-banner']?.nodeId, resolution_confidence: rule.score || 0.8, kb_injected: true });
        changes.push({ type: 'añadido', component: 'notification-banner', reason: rule.content, rule_cat: cat, rule_pri: pri, rule_id: rule.id, score: rule.score });
      }
      return;
    }

    // RESTRICCION → reemplazar o eliminar componentes afectados
    if (cat === 'restriccion') {
      affected.forEach(function(compName) {
        const idx = result.findIndex(c => c.component === compName);
        if (idx === -1) return;
        const repl = KB_REPLACEMENT_COMPONENTS[compName];
        // Guardia: nunca reemplazar por empty-state vía KB (demasiado agresivo)
        if (repl && repl.component === 'empty-state') return;
        if (repl && contracts[repl.component]) {
          const original = result[idx];
          result[idx] = { slot: repl.component, component: repl.component, order: original.order, required: true, variant: repl.variant, props: { text: rule.content }, node_id: contracts[repl.component]?.nodeId, resolution_confidence: rule.score || 0.9, kb_injected: true };
          changes.push({ type: 'reemplazado', from: compName, to: repl.component, reason: rule.content, rule_cat: cat, rule_pri: pri, rule_id: rule.id, score: rule.score });
        } else {
          result.splice(idx, 1);
          changes.push({ type: 'eliminado', component: compName, reason: rule.content, rule_cat: cat, rule_pri: pri, rule_id: rule.id, score: rule.score });
        }
      });
    }

    // RECOMENDACION alta → añadir componentes si no existen
    if (cat === 'recomendacion' && pri === 'alta') {
      affected.forEach(function(compName) {
        // Guardia: KB nunca puede inyectar empty-state directamente.
        // Solo aparece si intent_type === 'error-estado' o brief explícito.
        if (compName === 'empty-state') return;
        if (!result.some(c => c.component === compName) && contracts[compName]) {
          const maxOrder = Math.max(...result.map(c => c.order), 0);
          result.push({ slot: compName, component: compName, order: maxOrder + 1, required: false, variant: 'default', props: {}, node_id: contracts[compName]?.nodeId, resolution_confidence: rule.score || 0.75, kb_injected: true });
          changes.push({ type: 'añadido', component: compName, reason: rule.content, rule_cat: cat, rule_pri: pri, rule_id: rule.id, score: rule.score });
        }
      });
    }

    // DS-PATTERN → registrar como informativo sin cambiar composición
    if (cat === 'ds-pattern') {
      changes.push({ type: 'patrón-aplicado', component: null, reason: rule.content, rule_cat: cat, rule_pri: pri, rule_id: rule.id, score: rule.score });
    }
  });

  result = result.sort((a, b) => a.order - b.order).map((c, i) => ({ ...c, order: i + 1 }));
  return { components: result, kb_changes: changes };
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

    const rawResult      = buildCompositionPlan(brief, intent, patternData, contracts);
    const baseComponents = reorderComponents(resolveExclusivity(rawResult.components, brief));

    // ── AGENTES: UXWriter + UXSpec en paralelo ────────────────────────────
    const agentResult  = await runAgents({ brief, components: baseComponents, intent, kbRules, contracts });
    const agentComponents = agentResult.components;

    // ── APLICAR REGLAS KB (governance final — red de seguridad) ───────────
    const kbApplied  = applyKBRules(agentComponents, kbRules, contracts, intent);
    const components = kbApplied.components;
    const kb_changes = kbApplied.kb_changes;

    const confidence = calculateScore({ pattern: patternName, components, intent, contracts: Object.values(contracts) });
    const violations = buildViolationsSummary(intent.brief_violations || [], components);
    const screenId   = 'gen_' + Date.now();

    console.log('  ✓ ' + components.length + ' componentes | ' + confidence.status + ' | KB: ' + (kbRules.length > 0 ? kbRules.length + ' reglas, ' + kb_changes.length + ' cambios' : 'sin contexto') + ' | agentes: ✓');

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
      kb_changes:       kb_changes,
      agent_meta:       agentResult.agent_meta,
      meta: { engine_version: '1.0.0', phase: 'Fase 4 — Knowledge Base', generated_at: new Date().toISOString() }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
