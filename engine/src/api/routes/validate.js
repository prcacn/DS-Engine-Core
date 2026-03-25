// api/routes/validate.js - Fase 4 (Studio)
// POST /validate
// Valida una pantalla existente: recibe brief + componentes del frame de Figma
// Devuelve el mismo formato de confidence score que /generate para que el Studio
// pueda mostrar el desglose y decidir si desbloquear la exportación.

const express            = require('express');
const router             = express.Router();
const { parseIntent }    = require('../../core/intentParser');
const { calculateScore } = require('../../core/confidenceScore');
const { loadContracts }  = require('../../loaders/contractLoader');
const { loadPatterns }   = require('../../loaders/patternLoader');

// Reutilizamos el cliente KB del mismo módulo que generate
let kb;
try {
  const { Pinecone } = require('@pinecone-database/pinecone');
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pc.index(process.env.PINECONE_INDEX || 'ds-knowledge-base');

  kb = {
    search: async function(query, opts = {}) {
      const topK = opts.topK || 4;
      const results = await index.searchRecords({
        query: { inputs: { text: query }, topK },
        fields: ['content', 'tipo', 'geografia', 'categoria', 'prioridad', 'autor', 'id'],
      });
      return (results.result?.hits || []).map(h => ({
        id:         h._id,
        score:      h._score,
        content:    h.fields?.content || '',
        tipo:       h.fields?.tipo || '',
        geografia:  h.fields?.geografia || '',
        categoria:  h.fields?.categoria || '',
        prioridad:  h.fields?.prioridad || '',
      }));
    }
  };
} catch (e) {
  kb = { search: async () => [] };
}

// ─── VALIDACIONES ESTRUCTURALES ───────────────────────────────────────────────
// Reglas que se pueden comprobar sin LLM - multiplicidad, exclusividad, etc.

function validateStructure(components) {
  const errors   = [];
  const warnings = [];
  const names    = components.map(c => c.component);
  const counts   = {};
  names.forEach(n => { counts[n] = (counts[n] || 0) + 1; });

  if ((counts['button-primary'] || 0) > 1) {
    errors.push({ rule: 'max-1-button-primary', detail: `Hay ${counts['button-primary']} button-primary. Máximo 1 por pantalla.` });
  }
  if ((counts['navigation-header'] || 0) > 1) {
    errors.push({ rule: 'max-1-navigation-header', detail: 'Solo puede haber 1 navigation-header.' });
  }
  if ((counts['filter-bar'] || 0) > 1) {
    errors.push({ rule: 'max-1-filter-bar', detail: 'Solo puede haber 1 filter-bar.' });
  }
  if ((counts['tab-bar'] || 0) > 1) {
    errors.push({ rule: 'max-1-tab-bar', detail: 'Solo puede haber 1 tab-bar.' });
  }
  if ((counts['empty-state'] || 0) > 0 && (counts['card-item'] || 0) > 0) {
    errors.push({ rule: 'empty-state-exclusivity', detail: 'empty-state y card-item son mutuamente excluyentes.' });
  }
  if ((counts['modal-bottom-sheet'] || 0) > 1) {
    warnings.push({ rule: 'max-1-modal', detail: 'No se recomienda más de 1 modal al mismo tiempo.' });
  }

  return { errors, warnings };
}

// ─── VALIDAR CONTRA KB ────────────────────────────────────────────────────────
// Comprueba si la composición viola alguna regla de la KB

function checkKBViolations(components, kbRules, intent) {
  const violations = [];
  const intentGeo  = (intent?.constraints?.geography || '').toLowerCase();

  const GEO_MARKERS = [
    { marker: 'solo en colombia',   geo: 'colombia' },
    { marker: 'solo en méxico',     geo: 'mexico'   },
    { marker: 'solo en mexico',     geo: 'mexico'   },
    { marker: 'geography=colombia', geo: 'colombia' },
  ];

  const KB_COMPONENT_KEYWORDS = {
    'fondos':      ['card-item', 'filter-bar'],
    'perfil':      ['empty-state'],
    'riesgo':      ['card-item', 'filter-bar', 'empty-state'],
    'transferencia': ['input-text', 'button-primary'],
    'confirmacion': ['modal-bottom-sheet', 'button-primary', 'button-secondary'],
    'autenticacion': ['input-text', 'button-primary'],
    'inicio sesion': ['input-text', 'button-primary'],
    'kyc':          ['input-text', 'button-primary'],
  };

  for (const rule of kbRules) {
    const ruleText = (rule.content || '').toLowerCase();
    const cat      = rule.categoria || 'recomendacion';
    if (cat !== 'restriccion') continue;

    // Filtro geográfico
    let geoRestricted = false;
    for (const { marker, geo } of GEO_MARKERS) {
      if (ruleText.includes(marker)) {
        geoRestricted = true;
        if (intentGeo !== geo) break; // regla no aplica
        // sí aplica - comprobar componentes afectados
        for (const [kw, comps] of Object.entries(KB_COMPONENT_KEYWORDS)) {
          if (ruleText.includes(kw)) {
            const violating = components.filter(c => comps.includes(c.component));
            if (violating.length > 0) {
              violations.push({
                rule_id:    rule.id,
                rule:       rule.content,
                severity:   'error',
                components: violating.map(c => c.component),
              });
            }
          }
        }
        break;
      }
    }

    if (!geoRestricted) {
      for (const [kw, comps] of Object.entries(KB_COMPONENT_KEYWORDS)) {
        if (ruleText.includes(kw)) {
          const violating = components.filter(c => comps.includes(c.component));
          if (violating.length > 0) {
            violations.push({
              rule_id:    rule.id,
              rule:       rule.content,
              severity:   'error',
              components: violating.map(c => c.component),
            });
          }
        }
      }
    }
  }

  return violations;
}

// ─── SCORE DE VALIDACIÓN ──────────────────────────────────────────────────────
// Usa exactamente las mismas 4 señales y pesos que confidenceScore.js (generate)
// para que Studio y Generate sean coherentes:
//   CONTRACT 30% · INTENT 25% · PRECEDENT 25% · RULES 20%

function calculateValidationScore(components, intent, contracts, kbViolations, structErrors) {
  const total = components.length;

  // ── SIGNAL 1: CONTRACT (30%) ─────────────────────────────────────────────
  // Igual que scoreContractCoverage en confidenceScore.js
  // Componente con nodeId resuelto + contrato completo → 1.0
  // Solo nodeId → 0.5
  // Sin nodeId ni contrato → 0
  const contractMap = {};
  Object.entries(contracts).forEach(([k, v]) => { contractMap[k] = v; });

  const detachedComponents = components
    .filter(c => c.detached)
    .map(c => ({ component: c.component, reason: 'Componente detacheado - usa la instancia del DS en su lugar' }));

  let contractResolved = 0;
  for (const comp of components) {
    const hasNodeId    = comp.node_id && comp.node_id !== 'pending';
    const contract     = contractMap[comp.component];
    const hasWhenToUse = contract && contract.whenToUse && contract.whenToUse.length > 0;
    const detachFactor = comp.detached ? 0.5 : 1.0;

    if (hasNodeId && hasWhenToUse) contractResolved += 1.0 * detachFactor;
    else if (hasNodeId)            contractResolved += 0.5 * detachFactor;
  }
  const contract_score = total > 0 ? Math.min(contractResolved / total, 1.0) : 0;

  // ── SIGNAL 2: INTENT (25%) ───────────────────────────────────────────────
  // Confianza del intentParser - igual que scoreIntentClarity
  const intent_score = (intent && typeof intent.confidence === 'number')
    ? Math.min(Math.max(intent.confidence, 0), 1)
    : 0.60;

  // ── SIGNAL 3: PRECEDENT (25%) ────────────────────────────────────────────
  // Reutilizar scorePrecedent del confidenceScore
  let precedent_score = 0.30;
  try {
    const scoreResult = calculateScore({
      pattern:    intent?.intent_type || 'unknown',
      components,
      intent,
      contracts:  Object.values(contracts),
    });
    precedent_score = scoreResult.signals?.precedent ?? 0.30;
  } catch (e) { /* baseline */ }

  // ── SIGNAL 4: RULES (20%) ────────────────────────────────────────────────
  // Errores estructurales + violaciones KB + detaches
  const names = components.map(c => c.component);
  let violations = 0;

  // Singletons
  if ((names.filter(n => n === 'navigation-header').length) > 1) violations++;
  if ((names.filter(n => n === 'button-primary').length) > 1)    violations++;
  if ((names.filter(n => n === 'modal-bottom-sheet').length) > 1) violations++;
  if ((names.filter(n => n === 'filter-bar').length) > 1)        violations++;

  // Exclusividad card-item / empty-state
  const bothRequired = components.some(c => c.component === 'card-item') &&
                       components.some(c => c.component === 'empty-state');
  if (bothRequired) violations++;

  // Errores estructurales adicionales
  violations += structErrors.length;

  // KB violations
  violations += kbViolations.length;

  // Detaches (penalización menor)
  violations += detachedComponents.length * 0.5;

  const rules_score = violations === 0 ? 1.0
                    : violations <= 1   ? 0.60
                    : 0.20;

  // ── GLOBAL: mismos pesos que confidenceScore.js ──────────────────────────
  const WEIGHTS = { contract: 0.30, intent: 0.25, precedent: 0.25, rules: 0.20 };
  const global = (contract_score  * WEIGHTS.contract)
               + (intent_score    * WEIGHTS.intent)
               + (precedent_score * WEIGHTS.precedent)
               + (rules_score     * WEIGHTS.rules);

  const rounded = Math.round(global * 100) / 100;
  const status  = rounded >= 0.80 ? 'AUTO_APPROVE'
                : rounded >= 0.60 ? 'REVIEW_FLAGGED'
                : 'NEEDS_REVIEW';

  return {
    global:   rounded,
    // Nombres alineados con generate para que la UI muestre las mismas barras
    contract:  parseFloat(contract_score.toFixed(2)),
    intent:    parseFloat(intent_score.toFixed(2)),
    precedent: parseFloat(precedent_score.toFixed(2)),
    rules:     parseFloat(rules_score.toFixed(2)),
    detached_components: detachedComponents,
    status,
  };
}

// ─── ROUTE ────────────────────────────────────────────────────────────────────

router.post('/', async function(req, res, next) {
  try {
    const { brief, components, frame_id } = req.body;

    if (!brief || !brief.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    }
    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo components (array) es requerido' });
    }

    console.log(`  → Validando frame ${frame_id || '?'} con ${components.length} componentes`);

    const contracts = loadContracts();

    // 1. Intent del brief
    let intent;
    try {
      intent = await parseIntent(brief);
    } catch (e) {
      intent = { intent_type: 'unknown', domain: '', constraints: {}, brief_violations: [] };
    }

    // 2. KB - buscar reglas relevantes
    let kbRules = [];
    try {
      kbRules = await kb.search(brief, { topK: 4 });
    } catch (e) { /* sin KB */ }

    // 3. Validaciones estructurales
    const { errors: structErrors, warnings: structWarnings } = validateStructure(components);

    // 4. Violaciones KB
    const kbViolations = checkKBViolations(components, kbRules, intent);

    // 5. Score
    const confidence = calculateValidationScore(
      components, intent, contracts, kbViolations, structErrors
    );

    // 6. Componentes no reconocidos
    const unknown = components.filter(c => !contracts[c.component]).map(c => c.component);

    console.log(`  ✓ Validación: score=${Math.round(confidence.global * 100)}% | errores=${structErrors.length} | kb_violations=${kbViolations.length}`);

    res.json({
      ok:          true,
      frame_id:    frame_id || null,
      brief:       brief.trim(),
      components:  components.length,
      intent,
      confidence,
      struct_errors:   structErrors,
      struct_warnings: structWarnings,
      kb_violations:   kbViolations,
      kb_rules:        kbRules,
      unknown_components: unknown,
      pattern:     intent?.intent_type || 'unknown',
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
