/**
 * confidenceScore.js — Fase 3
 * 4-signal weighted confidence scoring
 *
 * Signals:
 *   contract_coverage  30% — node_id resuelto + whenToUse poblado
 *   precedent          25% — ejemplos aprobados en /examples que coincidan con el patrón
 *   intent_clarity     25% — score de confianza del intentParser (Claude API)
 *   rule_compliance    20% — sin violaciones de exclusividad ni reglas de composición
 *
 * Thresholds:
 *   >= 0.80  → AUTO_APPROVE
 *   >= 0.60  → REVIEW_FLAGGED
 *    < 0.60  → NEEDS_REVIEW
 */

const fs   = require('fs');
const path = require('path');

const WEIGHTS = {
  contract_coverage: 0.30,
  precedent:         0.25,
  intent_clarity:    0.25,
  rule_compliance:   0.20,
};

const THRESHOLDS = {
  AUTO_APPROVE:   0.80,
  REVIEW_FLAGGED: 0.60,
};

/**
 * Computes the full confidence object for a composition plan.
 *
 * @param {object} params
 * @param {string} params.pattern       — matched pattern name
 * @param {object[]} params.components  — resolved component list
 * @param {object} params.intent        — IntentObject from intentParser
 * @param {object[]} params.contracts   — loaded contract objects
 * @returns {object} confidence
 */
function computeConfidence({ pattern, components, intent, contracts }) {
  const signals = {
    contract_coverage: scoreContractCoverage(components, contracts),
    precedent:         scorePrecedent(pattern),
    intent_clarity:    scoreIntentClarity(intent),
    rule_compliance:   scoreRuleCompliance(components),
  };

  const global = Object.entries(signals).reduce((sum, [key, val]) => {
    return sum + val * WEIGHTS[key];
  }, 0);

  const rounded = Math.round(global * 100) / 100;

  const status = rounded >= THRESHOLDS.AUTO_APPROVE
    ? 'AUTO_APPROVE'
    : rounded >= THRESHOLDS.REVIEW_FLAGGED
      ? 'REVIEW_FLAGGED'
      : 'NEEDS_REVIEW';

  const weak_signals = detectWeakSignals(signals, intent);

  return {
    global: rounded,
    status,
    signals,
    weak_signals,
  };
}

// ─── SIGNAL 1: Contract Coverage (30%) ────────────────────────────────────────
// Checks that each component in the plan has:
//   - a resolved node_id (not 'pending')
//   - a populated whenToUse field in its contract
function scoreContractCoverage(components, contracts) {
  if (!components || components.length === 0) return 0;

  const contractMap = {};
  (contracts || []).forEach(c => { contractMap[c.id || c.name] = c; });

  let resolved = 0;
  for (const comp of components) {
    const hasNodeId   = comp.node_id && comp.node_id !== 'pending';
    const contract    = contractMap[comp.component];
    const hasWhenToUse = contract && contract.whenToUse && contract.whenToUse.length > 10;

    if (hasNodeId && hasWhenToUse) resolved++;
    else if (hasNodeId) resolved += 0.5; // partial credit
  }

  return Math.min(resolved / components.length, 1.0);
}

// ─── SIGNAL 2: Precedent (25%) ────────────────────────────────────────────────
// Checks /examples directory for approved screens matching the pattern.
// Score:
//   0 examples → 0.30 (baseline — pattern exists but no approved precedent)
//   1 example  → 0.70
//   2+ examples → 1.00
function scorePrecedent(pattern) {
  const examplesDir = path.join(
    process.env.DS_REPO_PATH || '',
    'examples'
  );

  try {
    if (!fs.existsSync(examplesDir)) return 0.30;

    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.md'));

    // Match files that contain the pattern name
    const matching = files.filter(f => {
      const normalized = f.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      return normalized.includes(pattern.toLowerCase());
    });

    // Also scan file contents for pattern match (belt + suspenders)
    const contentMatches = files.filter(f => {
      try {
        const content = fs.readFileSync(path.join(examplesDir, f), 'utf8');
        // Check for approved status + pattern match
        return content.includes(`pattern: ${pattern}`) &&
               content.includes('status: APPROVED');
      } catch { return false; }
    });

    const totalMatches = new Set([...matching, ...contentMatches]).size;

    if (totalMatches === 0) return 0.30;
    if (totalMatches === 1) return 0.70;
    return 1.00;

  } catch {
    return 0.30;
  }
}

// ─── SIGNAL 3: Intent Clarity (25%) ──────────────────────────────────────────
// Uses the confidence score from the Claude API intent parser.
// Falls back to 0.60 if intent is unavailable.
function scoreIntentClarity(intent) {
  if (!intent) return 0.60;
  const score = intent.confidence;
  if (typeof score !== 'number') return 0.60;
  return Math.min(Math.max(score, 0), 1);
}

// ─── SIGNAL 4: Rule Compliance (20%) ─────────────────────────────────────────
// Checks for known constraint violations:
//   - card-item + empty-state coexisting (exclusivity violation)
//   - multiple navigation-headers
//   - multiple modals
//   - button-primary count > 1
function scoreRuleCompliance(components) {
  if (!components || components.length === 0) return 1.0;

  const names = components.map(c => c.component);
  let violations = 0;

  // Exclusivity: card-item and empty-state cannot coexist as both required
  const hasCard  = names.includes('card-item');
  const hasEmpty = names.includes('empty-state');
  const bothRequired = components.some(c => c.component === 'card-item'  && c.required) &&
                       components.some(c => c.component === 'empty-state' && c.required);
  if (hasCard && hasEmpty && bothRequired) violations++;

  // Max 1 navigation-header
  const navCount = names.filter(n => n === 'navigation-header').length;
  if (navCount > 1) violations++;

  // Max 1 modal open
  const modalCount = names.filter(n => n === 'modal-bottom-sheet').length;
  if (modalCount > 1) violations++;

  // Max 1 button-primary
  const primaryCount = names.filter(n => n === 'button-primary').length;
  if (primaryCount > 1) violations++;

  if (violations === 0) return 1.0;
  if (violations === 1) return 0.60;
  return 0.20;
}

// ─── WEAK SIGNALS DETECTION ───────────────────────────────────────────────────
function detectWeakSignals(signals, intent) {
  const weak = [];

  if (signals.precedent < 0.70) {
    weak.push('Sin ejemplos aprobados para este patrón — considera añadir uno a /examples');
  }

  if (signals.contract_coverage < 0.80) {
    weak.push('Algunos componentes tienen node_id pendiente o contratos incompletos');
  }

  if (signals.intent_clarity < 0.70) {
    weak.push('Brief ambiguo — considera ser más específico en la descripción');
  }

  if (signals.rule_compliance < 1.0) {
    weak.push('Violación de reglas de composición detectada — revisa exclusividades');
  }

  if (intent && !intent.domain) {
    weak.push('Dominio no identificado — el engine usó detección por keywords');
  }

  return weak;
}

// ─── STATUS HELPER ────────────────────────────────────────────────────────────
function resolveStatus(score) {
  if (score >= THRESHOLDS.AUTO_APPROVE)   return 'AUTO_APPROVE';
  if (score >= THRESHOLDS.REVIEW_FLAGGED) return 'REVIEW_FLAGGED';
  return 'NEEDS_REVIEW';
}

module.exports = { computeConfidence, scorePrecedent, resolveStatus, WEIGHTS, THRESHOLDS };
module.exports.calculateScore = module.exports.computeConfidence;
