// api/routes/render.js
// POST /render — genera HTML de producción listo para usar
// Acepta el mismo body que /generate + opción target
//
// Body:
//   brief    string   — descripción de la pantalla
//   pattern  string?  — forzar patrón (opcional)
//   target   string?  — "html" (default) | "preview"
//
// Response (target=html):
//   {
//     html:       string   — HTML completo con CSS variables del DS
//     css_vars:   string   — solo el bloque :root con los tokens
//     components: array    — el array de componentes del engine
//     meta: { pattern, intent, score, ... }
//   }

const express  = require('express');
const router   = express.Router();
const { parseIntent }            = require('../../core/intentParser');
const { enrichBriefWithKnowledge } = require('../../core/briefEnricher');
const { buildCompositionPlan }   = require('../../core/compositionBuilder');
const { applyKBRules }           = require('../../core/kbGovernance');
const { calculateScore }         = require('../../core/confidenceScore');
const { renderScreen, DS_CSS }   = require('../../core/screenRenderer');
const { loadContracts }          = require('../../loaders/contractLoader');
const { INTENT_TO_PATTERN }      = require('../../core/navigationMaps');

router.post('/', async function(req, res, next) {
  try {
    const { brief, pattern: forcedPattern, target = 'html' } = req.body;

    if (!brief || !brief.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo brief es requerido' });
    }

    console.log('\n  → [Render] brief:', brief.slice(0, 60));

    // ── 1. Enriquecer brief con KB ──────────────────────────────────────────
    const enrichResult   = forcedPattern
      ? { enrichedBrief: brief, kbRules: [], hasContext: false }
      : await enrichBriefWithKnowledge(brief);
    const enrichedBrief  = enrichResult.enrichedBrief;
    const kbRules        = enrichResult.kbRules;

    // ── 2. Parsear intent ───────────────────────────────────────────────────
    const intent = forcedPattern
      ? { intent_type: forcedPattern, confidence: 0.99, domain: 'manual', constraints: {} }
      : await parseIntent(enrichedBrief);

    const patternName = forcedPattern || INTENT_TO_PATTERN[intent.intent_type] || 'lista-con-filtros';

    // ── 3. Construir composición ────────────────────────────────────────────
    const contracts  = loadContracts();
    const components = await buildCompositionPlan(brief, intent, patternName, contracts);

    // ── 4. Aplicar reglas KB ────────────────────────────────────────────────
    const governed   = applyKBRules(components, kbRules, intent);

    // ── 5. Score ────────────────────────────────────────────────────────────
    const score = calculateScore({ components: governed, intent, pattern: patternName, kbRules });

    // ── 6. Render HTML ──────────────────────────────────────────────────────
    const screenData = { components: governed, pattern: patternName, intent, brief };

    const html = renderScreen(screenData, {
      withCSS:      target === 'html',
      target,
      wrapperClass: 'ds-screen',
    });

    // ── 7. Extraer solo el bloque :root de los tokens ───────────────────────
    const cssVarsMatch = DS_CSS.match(/:root\s*\{[^}]+\}/);
    const cssVars      = cssVarsMatch ? cssVarsMatch[0] : '';

    console.log('  ✓ [Render] HTML generado —', governed.length, 'componentes | score:', score.global);

    return res.json({
      html,
      css_vars:   cssVars,
      components: governed,
      meta: {
        brief:     brief.trim(),
        pattern:   patternName,
        intent,
        score,
        kb_rules:  kbRules.length,
        target,
        generated_at: new Date().toISOString(),
      }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
