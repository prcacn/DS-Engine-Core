// api/routes/approve.js - Level 5.4 + Decision Model v2
// POST /approve
// Gestiona el ciclo de aprobación variacional:
//   action: "approve" → guarda la variante como nuevo ejemplo aprobado + ingesta en KB
//   action: "modify"  → registra la modificación como regla implícita en KB
//   action: "reject"  → registra el motivo del rechazo en KB para no repetir el error

const express  = require('express');
const router   = express.Router();
const fs       = require('fs');
const path     = require('path');
const { save } = require('../../core/knowledgeBase');

const EXAMPLES_DIR = path.resolve(__dirname, '../../../examples');

// ─── GENERAR ID ÚNICO DE DECISIÓN ─────────────────────────────────────────────

function generateDecisionId() {
  return 'dec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

// ─── EXTRAER METADATA DE CONTEXTO ─────────────────────────────────────────────
// Infiere geo, segmento y dominio del brief cuando no vienen explícitos

function extractContext(brief, tags) {
  const text = (brief || '').toLowerCase();
  const t    = (tags || []).join(' ').toLowerCase();

  const geo = ['es', 'mx', 'co', 'ar', 'pe', 'us'].find(g =>
    text.includes(g) || t.includes(g)
  ) || 'unknown';

  const segment = text.includes('empresa') || text.includes('flota') || t.includes('b2b')
    ? 'B2B' : 'B2C';

  const domain = ['inversión', 'inversion', 'fondo', 'hipoteca', 'transferencia',
    'transaccion', 'transacción', 'pago', 'cuenta', 'saldo']
    .find(d => text.includes(d)) || 'general';

  return { geo, segment, domain };
}

// ─── GUARDAR VARIANTE APROBADA COMO NUEVO EJEMPLO ────────────────────────────

function saveApprovedVariant({ decision_id, screen_id, brief, base_id, components, diff }) {
  if (!fs.existsSync(EXAMPLES_DIR)) {
    fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
  }

  const id       = screen_id || ('var_' + Date.now());
  const filename = id.replace(/[^a-z0-9_-]/gi, '-') + '-aprobado.md';
  const filepath = path.join(EXAMPLES_DIR, filename);
  const fecha    = new Date().toISOString().split('T')[0];

  const compLines = (components || []).map(c => {
    var line = '- ' + c.component;
    if (c.variant && c.variant !== 'default') line += ' (variant: ' + c.variant + ')';
    if (c.props && c.props.title) line += ' - ' + c.props.title;
    return line;
  }).join('\n');

  var diffLines = '';
  if (diff) {
    if (diff.added?.length)    diffLines += '\n### Añadido\n' + diff.added.map(d => '- ' + (d.component || d)).join('\n');
    if (diff.modified?.length) diffLines += '\n### Modificado\n' + diff.modified.map(d => '- ' + (d.component || d)).join('\n');
    if (diff.removed?.length)  diffLines += '\n### Eliminado\n' + diff.removed.map(d => '- ' + (d.component || d)).join('\n');
  }

  const md = [
    '# ' + (brief || id),
    '**decision_id:** ' + decision_id,
    '**pattern:** ' + (components?.[0]?.pattern || 'variant'),
    '**status:** APPROVED',
    '**score:** 0.90',
    '**base_id:** ' + (base_id || '-'),
    '**brief:** ' + (brief || ''),
    '**fecha:** ' + fecha,
    '',
    '## Descripción',
    'Variante aprobada de ' + (base_id || 'base desconocida') + '. Generada y validada por el diseñador.',
    '',
    '## Componentes',
    compLines,
    diffLines ? '\n## Delta respecto a la base' + diffLines : '',
    '',
    '## Notas de aprobación',
    'Aprobada el ' + fecha + ' - generada por DS IA-Ready Engine Level 5.0',
  ].join('\n');

  fs.writeFileSync(filepath, md, 'utf-8');
  console.log('  ✓ [Approve] Variante guardada:', filename);
  return { id, filename };
}

// ─── ROUTE ────────────────────────────────────────────────────────────────────

router.post('/', async function(req, res, next) {
  try {
    const {
      action,
      screen_id,
      brief,
      base_id,
      components,
      diff,
      modification,
      reason,
      // Campos nuevos opcionales — si no vienen se infieren
      approved_by,
      project,
      client_geo,
      client_segment,
      pattern,
      tags,
    } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo action es requerido (approve|modify|reject)' });
    }

    // Generar ID único de decisión para trazabilidad
    const decision_id = generateDecisionId();

    // Inferir contexto del brief cuando no viene explícito
    const ctx = extractContext(brief, tags);
    const geo      = client_geo      || ctx.geo;
    const segment  = client_segment  || ctx.segment;
    const domain   = ctx.domain;
    const designer = approved_by     || 'unknown';
    const proj     = project         || 'unknown';
    const pat      = pattern         || components?.[0]?.pattern || 'unknown';

    // Detectar si hubo modificación antes de aprobar
    const modified_before_approval = !!(diff?.added?.length || diff?.modified?.length || diff?.removed?.length);

    console.log('  → [Approve] action:', action, '| decision:', decision_id, '| base:', base_id, '| screen:', screen_id);

    // ── APROBAR ──────────────────────────────────────────────────────────────
    if (action === 'approve') {

      // 1. Guardar como nuevo ejemplo aprobado en /examples
      const { id, filename } = saveApprovedVariant({ decision_id, screen_id, brief, base_id, components, diff });

      // 2. Ingestar en KB con metadata estructurada
      try {
        const diffSummary = [];
        if (diff?.added?.length)    diffSummary.push('Añadido: '   + diff.added.map(d => d.component || d).join(', '));
        if (diff?.modified?.length) diffSummary.push('Modificado: ' + diff.modified.map(d => d.component || d).join(', '));
        if (diff?.removed?.length)  diffSummary.push('Eliminado: '  + diff.removed.map(d => d.component || d).join(', '));

        await save({
          // Texto semántico para búsqueda vectorial
          content: 'VARIANTE APROBADA - ' + brief
            + '. Patrón: ' + pat
            + '. Base: ' + (base_id || '-')
            + (diffSummary.length ? '. Cambios: ' + diffSummary.join('. ') : '')
            + '. Geografía: ' + geo
            + '. Segmento: ' + segment
            + '. Dominio: ' + domain
            + '. Esta variante ha sido validada por el equipo y puede usarse como referencia.',

          categoria: 'ds-pattern',
          prioridad: 'media',

          // Metadata estructurada — recuperable y filtrable
          metadata: {
            decision_id,
            action:                    'approve',
            screen_id:                 id,
            base_id:                   base_id    || null,
            pattern:                   pat,
            brief:                     brief      || null,
            approved_by:               designer,
            project:                   proj,
            geo,
            segment,
            domain,
            modified_before_approval,
            modification_detail:       modified_before_approval ? diffSummary.join(' | ') : null,
            date:                      new Date().toISOString(),
            source:                    'approval-loop',
          },

          tags: [
            'variante-aprobada',
            base_id  || 'base',
            geo,
            segment.toLowerCase(),
            domain,
            pat,
          ].filter(Boolean),

          autor: designer,
        });

        console.log('  ✓ [Approve] Ingesta KB completada | decision_id:', decision_id);

      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }

      return res.json({ ok: true, action: 'approve', decision_id, new_example_id: id, filename });
    }

    // ── MODIFICAR Y APROBAR ───────────────────────────────────────────────────
    if (action === 'modify') {
      try {
        await save({
          content: 'CORRECCIÓN DE DISEÑADOR - Brief: "' + brief
            + '". Patrón: ' + pat
            + '. Base: ' + (base_id || '-')
            + '. El diseñador modificó la propuesta: "' + modification
            + '". Geografía: ' + geo
            + '. Tener en cuenta en futuras generaciones similares.',

          categoria: 'recomendacion',
          prioridad: 'media',

          metadata: {
            decision_id,
            action:             'modify',
            screen_id:          screen_id  || null,
            base_id:            base_id    || null,
            pattern:            pat,
            brief:              brief      || null,
            modification:       modification || null,
            approved_by:        designer,
            project:            proj,
            geo,
            segment,
            domain,
            date:               new Date().toISOString(),
            source:             'approval-loop',
          },

          tags: [
            'correccion-disenador',
            base_id || 'base',
            geo,
            segment.toLowerCase(),
            domain,
            pat,
          ].filter(Boolean),

          autor: designer,
        });

        console.log('  ✓ [Approve] Modificación ingresada en KB | decision_id:', decision_id);

      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }

      return res.json({ ok: true, action: 'modify', decision_id });
    }

    // ── RECHAZAR ─────────────────────────────────────────────────────────────
    if (action === 'reject') {
      try {
        await save({
          content: 'RECHAZO DE VARIANTE - Brief: "' + brief
            + '". Patrón: ' + pat
            + '. Base: ' + (base_id || '-')
            + (reason ? '. Motivo del rechazo: "' + reason + '".' : '.')
            + ' Geografía: ' + geo
            + '. No usar esta combinación en futuras generaciones similares.',

          categoria: 'restriccion',
          prioridad: 'media',

          metadata: {
            decision_id,
            action:       'reject',
            screen_id:    screen_id || null,
            base_id:      base_id   || null,
            pattern:      pat,
            brief:        brief     || null,
            reason:       reason    || null,
            rejected_by:  designer,
            project:      proj,
            geo,
            segment,
            domain,
            date:         new Date().toISOString(),
            source:       'approval-loop',
          },

          tags: [
            'rechazo-disenador',
            base_id || 'base',
            geo,
            segment.toLowerCase(),
            domain,
            pat,
          ].filter(Boolean),

          autor: designer,
        });

        console.log('  ✓ [Approve] Rechazo ingresado en KB | decision_id:', decision_id);

      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }

      return res.json({ ok: true, action: 'reject', decision_id });
    }

    return res.status(400).json({ error: 'BadRequest', message: 'action debe ser approve, modify o reject' });

  } catch(err) {
    next(err);
  }
});

module.exports = router;
