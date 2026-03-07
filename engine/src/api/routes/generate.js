// api/routes/generate.js — Fase 3+ (violations)
const express = require('express');
const router = express.Router();
const { parseIntent } = require('../../core/intentParser');
const { calculateScore } = require('../../core/confidenceScore');
const { loadContracts } = require('../../loaders/contractLoader');
const { loadPatterns } = require('../../loaders/patternLoader');

const INTENT_TO_PATTERN = { 'lista-con-filtros': 'lista-con-filtros', 'formulario-simple': 'formulario-simple', 'confirmacion': 'confirmacion', 'detalle': 'detalle' };

function resolveVariant(component, intent) {
  if (component === 'navigation-header') return ['detalle','formulario-simple','confirmacion'].includes(intent.intent_type) ? 'with-back' : 'default';
  if (component === 'modal-bottom-sheet') return (intent.constraints && intent.constraints.is_destructive) || intent.intent_type === 'confirmacion' ? 'confirmation' : 'default';
  if (component === 'filter-bar') return 'chips';
  return 'default';
}

function buildSmartProps(contract, intent, componentName) {
  const props = {};
  contract.properties.forEach(function(p) { if (p.default && p.default !== '""') props[p.name] = p.default.replace(/"/g, ''); });
  if (componentName === 'navigation-header' && intent.domain) props.title = intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1);
  if (componentName === 'empty-state' && intent.constraints && intent.constraints.has_filters) { props.action_label = 'Limpiar filtros'; props.illustration = 'no-results'; }
  if (componentName === 'button-primary' && intent.constraints && intent.constraints.is_destructive) props.label = 'Confirmar';
  return props;
}

function resolveOptional(component, intent, brief) {
  const b = brief.toLowerCase();
  if (component === 'button-primary') return { include: intent.intent_type === 'lista-con-filtros' && (b.includes('crear') || b.includes('nuevo') || b.includes('añadir')), confidence: 0.75 };
  if (component === 'modal-bottom-sheet') return { include: (intent.constraints && intent.constraints.needs_confirmation) || (intent.constraints && intent.constraints.is_destructive), confidence: 0.85 };
  if (component === 'button-secondary') return { include: intent.intent_type === 'confirmacion' || (intent.constraints && intent.constraints.needs_confirmation), confidence: 0.90 };
  if (component === 'card-item') return { include: intent.intent_type === 'confirmacion', confidence: 0.75 };
  return { include: false, confidence: 0 };
}

function buildCompositionPlan(brief, intent, patternData, contracts) {
  const components = [];
  patternData.requiredComponents.forEach(function(req, i) {
    const contract = contracts[req.component];
    if (!contract) return;
    components.push({ slot: req.component, component: req.component, order: i + 1, required: true, variant: resolveVariant(req.component, intent), props: buildSmartProps(contract, intent, req.component), node_id: contract.nodeId, resolution_confidence: 0.85 });
  });
  patternData.optionalComponents.forEach(function(opt) {
    const contract = contracts[opt.component];
    if (!contract) return;
    const r = resolveOptional(opt.component, intent, brief);
    if (r.include) components.push({ slot: opt.component, component: opt.component, order: components.length + 1, required: false, variant: resolveVariant(opt.component, intent), props: buildSmartProps(contract, intent, opt.component), node_id: contract.nodeId, resolution_confidence: r.confidence });
  });
  return { components, compositionRules: patternData.compositionRules };
}

function resolveExclusivity(components, brief) {
  const b = brief.toLowerCase();
  const hasExplicitEmpty = b.includes('vacío') || b.includes('vacio') || b.includes('sin resultados') || b.includes('empty');
  const hasCard = components.some(function(c) { return c.component === 'card-item'; });
  const hasEmpty = components.some(function(c) { return c.component === 'empty-state'; });
  if (hasCard && hasEmpty) return components.filter(function(c) { return c.component !== (hasExplicitEmpty ? 'card-item' : 'empty-state'); });
  return components;
}

function reorderComponents(components) {
  return components.sort(function(a, b) { return a.order - b.order; }).map(function(c, i) { return Object.assign({}, c, { order: i + 1 }); });
}

function buildViolationsSummary(intentViolations, components) {
  const violations = [];
  if (intentViolations && intentViolations.length > 0) {
    intentViolations.forEach(function(v) {
      violations.push({ source: 'brief', rule: v.rule, detail: v.detail, severity: v.severity, action: 'El engine ignoró esta parte del brief para mantener la gobernanza del DS' });
    });
  }
  const names = components.map(function(c) { return c.component; });
  const primaryCount = names.filter(function(n) { return n === 'button-primary'; }).length;
  if (primaryCount > 1) violations.push({ source: 'composition', rule: 'max-1-button-primary', detail: 'El plan contiene ' + primaryCount + ' button-primary. Solo se permite 1.', severity: 'error', action: 'Revisar manualmente' });
  return violations;
}

router.post('/', async function(req, res, next) {
  try {
    const brief = req.body.brief;
    const forcedPattern = req.body.pattern;
    if (!brief || !brief.trim()) return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    console.log('  → Generando para brief: "' + brief.substring(0, 60) + '..."');
    const contracts = loadContracts();
    const patterns = loadPatterns();
    const intent = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: {}, reasoning: 'Pattern forzado', brief_violations: [] }
      : await parseIntent(brief);
    const patternName = INTENT_TO_PATTERN[intent.intent_type] || 'lista-con-filtros';
    const patternData = patterns[patternName];
    if (!patternData) return res.status(404).json({ error: 'PatternNotFound', message: "Pattern '" + patternName + "' no encontrado" });
    const rawResult = buildCompositionPlan(brief, intent, patternData, contracts);
    const components = reorderComponents(resolveExclusivity(rawResult.components, brief));
    const confidence = calculateScore({ pattern: patternName, components, intent, contracts: Object.values(contracts) });
    const violations = buildViolationsSummary(intent.brief_violations || [], components);
    const screenId = 'gen_' + Date.now();
    console.log('  ✓ Plan: ' + components.length + ' componentes, status: ' + confidence.status + ', violations: ' + violations.length);
    res.json({
      screen_id: screenId, brief: brief.trim(), pattern: patternName, intent,
      status: confidence.status, confidence, violations, components,
      composition_rules: rawResult.compositionRules,
      meta: { engine_version: '1.0.0', phase: 'Fase 3+ — Violations', generated_at: new Date().toISOString() }
    });
  } catch (err) { next(err); }
});

module.exports = router;
