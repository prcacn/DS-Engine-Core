// api/routes/generate.js — Level 5.0
// Router limpio. Toda la lógica vive en módulos especializados:
//   core/navigationMaps.js      → INTENT_TO_LEVEL, INTENT_TO_PATTERN
//   core/compositionBuilder.js  → buildCompositionPlan, resolveVariant, helpers
//   core/kbGovernance.js        → applyKBRules, applyFinancialVariant
//   core/briefEnricher.js       → enrichBriefWithKnowledge (Level 4.0)
//   core/variantParser.js       → detectVariant (Level 5.1)
//   core/deltaEngine.js         → applyDelta (Level 5.2)

const express  = require('express');
const router   = express.Router();

// ── Core ──────────────────────────────────────────────────────────────────────
const { parseIntent }                             = require('../../core/intentParser');
const { calculateScore }                          = require('../../core/confidenceScore');
const { enrichBriefWithKnowledge }               = require('../../core/briefEnricher');
const { detect: detectVariant, loadApprovedExamples } = require('../../core/variantParser');
const { apply: applyDelta }                       = require('../../core/deltaEngine');
const { getNavLevel }                             = require('../../core/globalRulesParser');

// ── Navigation & Pattern maps ─────────────────────────────────────────────────
const { INTENT_TO_LEVEL, INTENT_TO_PATTERN, MULTISCREEN_INTENTS, inferNavLevelFromBrief } = require('../../core/navigationMaps');

// ── Composition ───────────────────────────────────────────────────────────────
const {
  buildCompositionPlan,
  buildMultiscreenFlow,
  buildViolationsSummary,
  reorderComponents,
  resolveExclusivity,
  extractQuantities,
} = require('../../core/compositionBuilder');

// ── KB Governance ─────────────────────────────────────────────────────────────
const { applyKBRules, applyFinancialVariant } = require('../../core/kbGovernance');

// ── Loaders ───────────────────────────────────────────────────────────────────
const { loadContracts }  = require('../../loaders/contractLoader');
const { loadPatterns }   = require('../../loaders/patternLoader');
const { findTemplate }   = require('../../loaders/templateLoader');

// ── Knowledge Base ────────────────────────────────────────────────────────────
const { search: kbSearch } = require('../../core/knowledgeBase');

// ── Agents ────────────────────────────────────────────────────────────────────
const { runAgents } = require('../../agents/orchestrator');

// ── Multiscreen flows ─────────────────────────────────────────────────────────
// Intents que generan múltiples pantallas en lugar de una sola
// (MULTISCREEN_INTENTS viene de navigationMaps)

// ─── DEFINICIÓN DE FLUJOS MULTIPANTALLA ───────────────────────────────────────
// Cada flujo define sus pantallas en orden fijo.
// Estas pantallas son obligatorias y no se pueden omitir.

// ─── SPACING TOKENS (DS) ─────────────────────────────────────────────────────
// gap-xl = 16px → entre grupos distintos de campos (list-header nuevo)
// gap-md = 8px  → entre campos del mismo grupo
// gap-xs = 2px  → entre card-items de resumen (filas de datos)
const DS_GAP = { xl: 16, md: 8, xs: 2 };

const MULTISCREEN_FLOWS = {
  'transferencia-bancaria': [
    {
      // ── PASO 1: Origen + Destino + Importe (fusionado) ──────────────────
      // Pasos 1 y 2 del flujo anterior ahora son uno solo.
      // Spacing: gap-xl entre grupo origen y grupo destinatario.
      // button-primary sticky bottom según global-rules/navigation.md
      screen_number: 1,
      screen_id_suffix: 'origen-destino',
      title: 'Nueva transferencia',
      pattern: 'formulario-simple',
      nav_level: 'L2',
      nav_title: 'Nueva transferencia',
      spacing_rules: {
        between_groups: DS_GAP.xl,   // 16px entre list-header y siguiente grupo
        between_fields: DS_GAP.md,   // 8px entre campos del mismo grupo
        button_position: 'sticky-bottom',
      },
      required_components: [
        { component: 'navigation-header', variant: 'Type=Modal', props: { title: 'Nueva transferencia' } },
        { component: 'list-header',       variant: 'default',    props: { title: 'Cuenta de origen' }, gap_after: DS_GAP.md },
        { component: 'input-text',        variant: 'select',     props: { label: 'Cuenta de origen', required: true }, gap_after: DS_GAP.xl },
        { component: 'list-header',       variant: 'default',    props: { title: 'Destinatario' }, gap_after: DS_GAP.md },
        { component: 'input-text',        variant: 'default',    props: { label: 'IBAN / CLABE', helper_text: 'ES + 22 caracteres · MX 18 dígitos', required: true }, gap_after: DS_GAP.md },
        { component: 'input-text',        variant: 'numeric',    props: { label: 'Importe', placeholder: '0,00', required: true }, gap_after: DS_GAP.md },
        { component: 'input-text',        variant: 'default',    props: { label: 'Concepto', required: false }, gap_after: DS_GAP.xl },
        { component: 'button-primary',    variant: 'default',    props: { label: 'Continuar' }, position: 'sticky-bottom' },
      ],
      optional_components: [
        { component: 'notification-banner', variant: 'warning', props: { message: 'Has alcanzado el 80% de tu límite diario' } },
      ],
    },
    {
      // ── PASO 2: Revisión (OBLIGATORIA por normativa PSD2) ───────────────
      // Spacing: gap-xs entre card-items (son filas de datos, no tarjetas).
      // notification-banner de comisión OBLIGATORIO antes del button-primary.
      screen_number: 2,
      screen_id_suffix: 'revision',
      title: 'Revisa tu transferencia',
      pattern: 'detalle',
      nav_level: 'L2',
      nav_title: 'Revisa tu transferencia',
      spacing_rules: {
        between_card_items: DS_GAP.xs,  // 2px — filas de datos continuas
        before_button: DS_GAP.xl,       // 16px sobre el button-primary
        button_position: 'sticky-bottom',
      },
      required_components: [
        { component: 'navigation-header', variant: 'Type=Modal', props: { title: 'Revisa tu transferencia' } },
        { component: 'list-header',       variant: 'default',    props: { title: 'Detalle de la operación' }, gap_after: DS_GAP.md },
        { component: 'card-item',         variant: 'default',    props: { title: 'Cuenta origen', show_chevron: false }, gap_after: DS_GAP.xs },
        { component: 'card-item',         variant: 'default',    props: { title: 'Destinatario',  show_chevron: false }, gap_after: DS_GAP.xs },
        { component: 'card-item',         variant: 'default',    props: { title: 'Importe',       show_chevron: false }, gap_after: DS_GAP.xs },
        { component: 'card-item',         variant: 'default',    props: { title: 'Concepto',      show_chevron: false }, gap_after: DS_GAP.xl },
        { component: 'notification-banner', variant: 'info',     props: { message: 'Sin comisión' }, gap_after: DS_GAP.md },
        { component: 'button-primary',    variant: 'default',    props: { label: 'Confirmar transferencia' }, position: 'sticky-bottom' },
        { component: 'button-secondary',  variant: 'default',    props: { label: 'Modificar' } },
      ],
      optional_components: [],
      governance_note: 'Pantalla obligatoria por PSD2. No omitir bajo ninguna circunstancia.',
    },
    {
      // ── PASO 3: Confirmación (punto de no retorno) ──────────────────────
      // Modal bottom sheet con resumen compacto.
      // button-primary incluye el importe real cuando está disponible.
      screen_number: 3,
      screen_id_suffix: 'confirmacion',
      title: 'Confirmar envío',
      pattern: 'confirmacion',
      nav_level: 'L3',
      nav_title: '',
      required_components: [
        { component: 'navigation-header',  variant: 'Type=Modal',   props: { title: '' } },
        { component: 'modal-bottom-sheet', variant: 'confirmation', props: { title: 'Confirmar envío', description: 'Esta acción no se puede deshacer', confirm_label: 'Enviar transferencia', cancel_label: 'Cancelar' } },
      ],
      optional_components: [],
      governance_note: 'El label del confirm_label debe incluir el importe real: "Enviar 250 €".',
    },
    {
      // ── PASO 4: Resultado ────────────────────────────────────────────────
      screen_number: 4,
      screen_id_suffix: 'resultado',
      title: 'Transferencia enviada',
      pattern: 'detalle',
      nav_level: 'L3',
      nav_title: 'Transferencia enviada',
      required_components: [
        { component: 'navigation-header', variant: 'Type=Modal', props: { title: 'Transferencia enviada' } },
        { component: 'card-item',         variant: 'default',    props: { title: 'Destinatario',     show_chevron: false }, gap_after: DS_GAP.xs },
        { component: 'card-item',         variant: 'default',    props: { title: 'Importe enviado',  show_chevron: false }, gap_after: DS_GAP.xs },
        { component: 'card-item',         variant: 'default',    props: { title: 'Número de operación', show_chevron: false }, gap_after: DS_GAP.xl },
        { component: 'button-primary',    variant: 'default',    props: { label: 'Ir al inicio' }, position: 'sticky-bottom' },
      ],
      optional_components: [
        { component: 'notification-banner', variant: 'info',    props: { message: 'La transferencia puede tardar hasta 24h en hacerse efectiva' } },
        { component: 'button-secondary',    variant: 'default', props: { label: 'Nueva transferencia' } },
      ],
    },
  ],
};


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

    // ── LEVEL 5.1: detectar si el brief es variante de una base aprobada ─────
    const approvedExamples = loadApprovedExamples();
    const variantResult    = forcedPattern
      ? { isVariant: false }
      : await detectVariant(brief, approvedExamples);

    // Si es variante — aplicar delta sobre la base y devolver propuesta
    if (variantResult.isVariant && variantResult.base) {
      console.log('  → [Level5] Flujo variacional | base:', variantResult.baseId);
      const contracts   = loadContracts();
      const deltaResult = await applyDelta({
        base:      variantResult.base,
        delta:     variantResult.delta,
        brief,
        contracts,
      });

      return res.json({
        screen_id:    'var_' + Date.now(),
        brief:        brief.trim(),
        pattern:      variantResult.base.pattern,
        flow_type:    'variant',
        is_proposal:  true,
        base_id:      variantResult.baseId,
        base_title:   variantResult.base.title,
        variant_reasoning: variantResult.reasoning,
        diff:         deltaResult.diff,
        diff_summary: deltaResult.diff_summary,
        components:   deltaResult.proposal,
        status:       'NEEDS_REVIEW',
        confidence:   { global: variantResult.confidence, status: 'NEEDS_REVIEW' },
        violations:   [],
        meta: {
          engine_version: '1.0.0',
          phase:          'Level 5.1 — Variant Detection',
          generated_at:   new Date().toISOString(),
        }
      });
    }

    // ── LEVEL 4.0: enriquecer brief con KB ANTES de parseIntent ─────────────
    // kbRules se recupera aquí una sola vez y se reutiliza en agentes y governance
    const enrichResult = forcedPattern
      ? { enrichedBrief: brief, kbRules: [], hasContext: false }
      : await enrichBriefWithKnowledge(brief);
    const enrichedBrief   = enrichResult.enrichedBrief;
    const enrichedKbRules = enrichResult.kbRules;
    const hasContext      = enrichResult.hasContext;

    const intent = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: { is_multiscreen_flow: MULTISCREEN_INTENTS.includes(forcedPattern) }, reasoning: 'Pattern forzado', brief_violations: [] }
      : await parseIntent(enrichedBrief);

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

      const kbRulesMulti = await kbSearch(brief, { topK: 5, minScore: 0.60 }).catch(err => { console.error('  ✗ [KB] kbSearch error:', err.message); return []; });

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
        kb_rules:     kbRulesMulti,
        kb_changes:   [],
        meta: {
          engine_version: '1.0.0',
          phase: 'Fase 3+ — Multiscreen Flow Support',
          generated_at: new Date().toISOString()
        }
      });
    }

    // ── NIVEL DE NAVEGACIÓN ──────────────────────────────────────────────────
    // Nivel de navegación: refinado por contexto del brief
    const navLevel = inferNavLevelFromBrief(intent.intent_type, brief) || INTENT_TO_LEVEL[intent.intent_type] || 'L1';
    console.log('  → [nav] nivel: ' + navLevel + ' | intent: ' + intent.intent_type);

    // ── TEMPLATE APROBADO — si existe, usarlo directamente ────────────────
    // NO usar template si hay violaciones de error en el brief — el brief es inválido
    const hasErrorViolations = (intent.brief_violations || []).some(v => v.severity === 'error');
    const approvedTemplate = !hasErrorViolations ? findTemplate(intent.intent_type, brief) : null;
    if (approvedTemplate) {
      console.log('  ✓ [template] Template aprobado encontrado: ' + approvedTemplate.id);
      const kbRules = await kbSearch(brief, { topK: 5, minScore: 0.60 }).catch(err => { console.error('  ✗ [KB] kbSearch error:', err.message); return []; });
      const confidence = calculateScore({
        pattern:   patternName,
        components: approvedTemplate.components,
        intent,
        contracts: Object.values(contracts),
      });
      return res.json({
        screen_id:        'gen_' + Date.now(),
        brief:            brief.trim(),
        pattern:          patternName,
        nav_level:        navLevel,
        flow_type:        'single',
        from_template:    true,
        template_id:      approvedTemplate.id,
        intent,
        status:           confidence.status,
        confidence,
        violations:       [],
        components:       approvedTemplate.components,
        missing_components: [],
        kb_rules:         kbRules,
        kb_changes:       [],
        meta: { engine_version: '1.0.0', generated_at: new Date().toISOString() }
      });
    }

    // ── FLUJO ESTÁNDAR (pantalla única) — solo si no hay template aprobado ─
    const patternData = patterns[patternName];
    if (!patternData) {
      return res.status(404).json({ error: 'PatternNotFound', message: "Pattern '" + patternName + "' no encontrado" });
    }

    const rawResult = buildCompositionPlan(brief, intent, patternData, contracts);
    const rawComponents = rawResult.components;
    const compositionRules = rawResult.compositionRules;
    // ── AGENTES (UXWriter + UXSpec en paralelo) ──────────────────────────
    // kbRules ya viene de enrichBriefWithKnowledge — no repetir búsqueda
    const kbRules = enrichedKbRules.length > 0
      ? enrichedKbRules
      : await kbSearch(brief, { topK: 5, minScore: 0.60 }).catch(err => { console.error('  ✗ [KB] kbSearch error:', err.message); return []; });

    // ── Aplicar reglas KB sobre la composición ────────────────────────────
    const kbResult     = applyKBRules(rawComponents, kbRules, intent);
    const kbComponents = kbResult.components;
    const kbChanges    = kbResult.kb_changes;
    if (kbChanges.length > 0) {
      console.log('  → [KB] ' + kbChanges.length + ' cambios aplicados al plan');
    }

    const agentResult = await runAgents({ brief, components: kbComponents, intent, kbRules, contracts });
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
  nav_level:         navLevel,
  from_template:     false,
  brief:             brief.trim(),
  pattern:           patternName,
  flow_type:         'single',
  intent,
  status:            confidence.status,
  confidence,
  violations,
  components,
  composition_rules: compositionRules,
  agent_meta:        agentMeta,
  kb_rules:          kbRules,
  kb_changes:        [...(kbChanges || []), ...(agentMeta?.kb_changes || [])],
  meta: { engine_version: '1.0.0', phase: 'Level 4.0 — Brief Enrichment', kb_enriched: hasContext || false, generated_at: new Date().toISOString() }
});

  } catch (err) {
    next(err);
  }
});

module.exports = router;





