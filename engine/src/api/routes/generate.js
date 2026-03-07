// api/routes/generate.js — Fase 3 (fixed)
// Fix: empty-state y card-item son mutuamente excluyentes

const express                  = require('express');
const router                   = express.Router();
const { parseIntent }          = require('../../core/intentParser');
const { calculateScore }       = require('../../core/confidenceScore');
const { loadContracts }        = require('../../loaders/contractLoader');
const { loadPatterns }         = require('../../loaders/patternLoader');

const INTENT_TO_PATTERN = {
  'lista-con-filtros': 'lista-con-filtros',
  'formulario-simple': 'formulario-simple',
  'confirmacion':      'confirmacion',
  'detalle':           'detalle'
};

function resolveVariant(component, intent) {
  const variants = {
    'navigation-header':  () => ['detalle','formulario-simple','confirmacion'].includes(intent.intent_type) ? 'with-back' : 'default',
    'modal-bottom-sheet': () => intent.constraints?.is_destructive || intent.intent_type === 'confirmacion' ? 'confirmation' : 'default',
    'filter-bar':         () => 'chips',
  };
  return variants[component] ? variants[component]() : 'default';
}

function buildSmartProps(contract, intent, componentName) {
  const props = {};
  contract.properties.forEach(p => {
    if (p.default && p.default !== '""') props[p.name] = p.default.replace(/"/g, '');
  });
  if (componentName === 'navigation-header' && intent.domain) {
    props.title = intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1);
  }
  if (componentName === 'empty-state' && intent.constraints?.has_filters) {
    props.action_label = 'Limpiar filtros';
    props.illustration = 'no-results';
  }
  if (componentName === 'button-primary' && intent.constraints?.is_destructive) {
    props.label = 'Confirmar';
  }
  return props;
}

function resolveOptional(component, intent, brief) {
  const b = brief.toLowerCase();
  const rules = {
    'button-primary':     () => ({ include: intent.intent_type === 'lista-con-filtros' && (b.includes('crear') || b.includes('nuevo') || b.includes('añadir')), confidence: 0.75 }),
    'modal-bottom-sheet': () => ({ include: intent.constraints?.needs_confirmation || intent.constraints?.is_destructive, confidence: 0.85 }),
    'button-secondary':   () => ({ include: intent.intent_type === 'confirmacion' || intent.constraints?.needs_confirmation, confidence: 0.90 }),
    'card-item':          () => ({ include: intent.intent_type === 'confirmacion', confidence: 0.75 }),
  };
  return rules[component] ? rules[component]() : { include: false, confidence: 0 };
}

function buildCompositionPlan(brief, intent, patternData, contracts) {
  const components = [];

  patternData.requiredComponents.forEach((req, i) => {
    const contract = contracts[req.component];
    if (!contract) return;
    components.push({
      slot:      req.component,
      component: req.component,
      order:     i + 1,
      required:  true,
      variant:   resolveVariant(req.component, intent),
      props:     buildSmartProps(contract, intent, req.component),
      node_id:   contract.nodeId,
      resolution_confidence: 0.85
    });
  });

  patternData.optionalComponents.forEach(opt => {
    const contract = contracts[opt.component];
    if (!contract) return;
    const r = resolveOptional(opt.component, intent, brief);
    if (r.include) {
      components.push({
        slot:      opt.component,
        component: opt.component,
        order:     components.length + 1,
        required:  false,
        variant:   resolveVariant(opt.component, intent),
        props:     buildSmartProps(contract, intent, opt.component),
        node_id:   contract.nodeId,
        resolution_confidence: r.confidence
      });
    }
  });

  return { components, compositionRules: patternData.compositionRules };
}

function resolveExclusivity(components, brief) {
  const briefLower = brief.toLowerCase();

  // empty-state y card-item son mutuamente excluyentes
  // En generación asumimos estado con datos (card-item) por defecto
  // empty-state solo si el brief lo menciona explícitamente
  const hasExplicitEmpty = briefLower.includes('vacío') ||
                           briefLower.includes('vacio') ||
                           briefLower.includes('sin resultados') ||
                           briefLower.includes('sin datos') ||
                           briefLower.includes('empty');

  const hasCardItem   = components.some(c => c.component === 'card-item');
  const hasEmptyState = components.some(c => c.component === 'empty-state');

  if (hasCardItem && hasEmptyState) {
    if (hasExplicitEmpty) {
      // Quitar card-item, mantener empty-state
      return components.filter(c => c.component !== 'card-item');
    } else {
      // Quitar empty-state, mantener card-item (caso por defecto)
      return components.filter(c => c.component !== 'empty-state');
    }
  }

  return components;
}

function reorderComponents(components) {
  // Reordenar por order para que los índices sean consecutivos
  return components
    .sort((a, b) => a.order - b.order)
    .map((c, i) => ({ ...c, order: i + 1 }));
}

router.post('/', async (req, res, next) => {
  try {
    const { brief, pattern: forcedPattern } = req.body;

    if (!brief || !brief.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    }

    console.log(`  → Generando para brief: "${brief.substring(0, 60)}..."`);

    const contracts = loadContracts();
    const patterns  = loadPatterns();

    // Intent Parser (Claude API)
    const intent = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: {}, reasoning: 'Pattern forzado' }
      : await parseIntent(brief);

    const patternName = INTENT_TO_PATTERN[intent.intent_type] || 'lista-con-filtros';
    const patternData = patterns[patternName];

    if (!patternData) {
      return res.status(404).json({ error: 'PatternNotFound', message: `Pattern '${patternName}' no encontrado` });
    }

    // Construir plan
    const { components: rawComponents, compositionRules } = buildCompositionPlan(brief, intent, patternData, contracts);

    // Resolver exclusividades y reordenar
    const components = reorderComponents(resolveExclusivity(rawComponents, brief));

    // Fase 3: Confidence Score calibrado con 4 señales
    const confidence = calculateScore({ pattern: patternName, components, intent, contracts: Object.values(contracts) });

    const screenId = `gen_${Date.now()}`;

    console.log(`  ✓ Plan generado: ${components.length} componentes, status: ${confidence.status}, confidence: ${confidence.global}`);
    if (confidence.weak_signals.length > 0) {
      console.log(`  ⚠ Señales débiles: ${confidence.weak_signals.join(' | ')}`);
    }

    res.json({
      screen_id:         screenId,
      brief:             brief.trim(),
      pattern:           patternName,
      intent,
      status:            confidence.status,
      confidence,
      components,
      composition_rules: compositionRules,
      meta: {
        engine_version: '1.0.0',
        phase:          'Fase 3 — Confidence Score calibrado',
        generated_at:   new Date().toISOString()
      }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
