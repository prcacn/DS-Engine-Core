// api/routes/approve.js - Level 5.4
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

// ─── GUARDAR VARIANTE APROBADA COMO NUEVO EJEMPLO ────────────────────────────

function saveApprovedVariant({ screen_id, brief, base_id, components, diff }) {
  if (!fs.existsSync(EXAMPLES_DIR)) {
    fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
  }

  const id       = screen_id || ('var_' + Date.now());
  const filename = id.replace(/[^a-z0-9_-]/gi, '-') + '-aprobado.md';
  const filepath = path.join(EXAMPLES_DIR, filename);
  const fecha    = new Date().toISOString().split('T')[0];

  // Serializar componentes
  const compLines = (components || []).map(c => {
    var line = '- ' + c.component;
    if (c.variant && c.variant !== 'default') line += ' (variant: ' + c.variant + ')';
    if (c.props && c.props.title) line += ' - ' + c.props.title;
    return line;
  }).join('\n');

  // Serializar diff
  var diffLines = '';
  if (diff) {
    if (diff.added?.length)    diffLines += '\n### Añadido\n' + diff.added.map(d => '- ' + (d.component || d)).join('\n');
    if (diff.modified?.length) diffLines += '\n### Modificado\n' + diff.modified.map(d => '- ' + (d.component || d)).join('\n');
    if (diff.removed?.length)  diffLines += '\n### Eliminado\n' + diff.removed.map(d => '- ' + (d.component || d)).join('\n');
  }

  const md = [
    '# ' + (brief || id),
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
    const { action, screen_id, brief, base_id, components, diff, modification, reason } = req.body;

    if (!action) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo action es requerido (approve|modify|reject)' });
    }

    console.log('  → [Approve] action:', action, '| base:', base_id, '| screen:', screen_id);

    // ── APROBAR ──────────────────────────────────────────────────────────────
    if (action === 'approve') {
      // 1. Guardar como nuevo ejemplo aprobado en /examples
      const { id, filename } = saveApprovedVariant({ screen_id, brief, base_id, components, diff });

      // 2. Ingestar en KB como ds-pattern para que future generaciones lo conozcan
      try {
        const diffSummary = [];
        if (diff?.added?.length)    diffSummary.push('Añadido: ' + diff.added.map(d => d.component || d).join(', '));
        if (diff?.modified?.length) diffSummary.push('Modificado: ' + diff.modified.map(d => d.component || d).join(', '));
        if (diff?.removed?.length)  diffSummary.push('Eliminado: ' + diff.removed.map(d => d.component || d).join(', '));

        await save({
          content:   'VARIANTE APROBADA - ' + brief + '. Base: ' + base_id + '. ' + diffSummary.join('. ') + '. Esta variante ha sido validada por el equipo y puede usarse como referencia.',
          categoria: 'ds-pattern',
          prioridad: 'media',
          tags:      ['variante-aprobada', base_id || 'base'],
          autor:     'approval-loop',
        });
        console.log('  ✓ [Approve] Ingesta KB completada');
      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }

      return res.json({ ok: true, action: 'approve', new_example_id: id, filename });
    }

    // ── MODIFICAR Y APROBAR ───────────────────────────────────────────────────
    if (action === 'modify') {
      try {
        await save({
          content:   'CORRECCIÓN DE DISEÑADOR - Brief: "' + brief + '". Base: ' + base_id + '. El diseñador modificó la propuesta: "' + modification + '". Tener en cuenta en futuras generaciones similares.',
          categoria: 'recomendacion',
          prioridad: 'media',
          tags:      ['correccion-disenador', base_id || 'base'],
          autor:     'approval-loop',
        });
        console.log('  ✓ [Approve] Modificación ingresada en KB');
      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }
      return res.json({ ok: true, action: 'modify' });
    }

    // ── RECHAZAR ─────────────────────────────────────────────────────────────
    if (action === 'reject') {
      try {
        await save({
          content:   'RECHAZO DE VARIANTE - Brief: "' + brief + '". Base: ' + base_id + (reason ? '. Motivo del rechazo: "' + reason + '".' : '.') + ' No usar esta combinación en futuras generaciones.',
          categoria: 'restriccion',
          prioridad: 'media',
          tags:      ['rechazo-disenador', base_id || 'base'],
          autor:     'approval-loop',
        });
        console.log('  ✓ [Approve] Rechazo ingresado en KB');
      } catch(kbErr) {
        console.warn('  ⚠ [Approve] KB ingest error:', kbErr.message);
      }
      return res.json({ ok: true, action: 'reject' });
    }

    return res.status(400).json({ error: 'BadRequest', message: 'action debe ser approve, modify o reject' });

  } catch(err) {
    next(err);
  }
});

module.exports = router;
