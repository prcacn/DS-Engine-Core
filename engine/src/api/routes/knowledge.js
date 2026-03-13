// api/routes/knowledge.js — Fase 4 (Studio + KB Portal)
// Usa el mismo cliente knowledgeBase.js que /generate
//
//   POST /knowledge/save-example   → guarda pantalla validada como ejemplo
//   POST /knowledge/save-template  → guarda pantalla como template
//   POST /knowledge/ingest         → ingesta libre de conocimiento
//   GET  /knowledge/list           → lista entradas recientes
//   DELETE /knowledge/:id          → elimina una entrada

const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const kb      = require('../../core/knowledgeBase');

// ─── EXAMPLES DIR (filesystem) ────────────────────────────────────────────────

function getExamplesDir() {
  const dsPath = process.env.DS_REPO_PATH;
  if (!dsPath) return null;
  const dir = path.join(dsPath, 'examples');
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (e) { return null; }
  }
  return dir;
}

function saveExampleFile(id, data) {
  const dir = getExamplesDir();
  if (!dir) return false;
  try {
    fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2), 'utf8');
    console.log(`  ✓ Example en disco: ${id}.json`);
    return true;
  } catch (e) {
    console.warn('  ⚠ No se pudo guardar en disco:', e.message);
    return false;
  }
}

// ─── POST /knowledge/save-example ────────────────────────────────────────────

router.post('/save-example', async function(req, res, next) {
  try {
    const { brief, components, score, pattern, author } = req.body;

    if (!brief || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'BadRequest', message: 'Campos requeridos: brief, components[]' });
    }

    const content = [
      `EXAMPLE APROBADO: ${brief}`,
      `Pattern: ${pattern || 'unknown'}`,
      `Score: ${score || 0}%`,
      `Componentes: ${components.map(c => c.component).join(', ')}`,
    ].join('\n');

    const result = await kb.save({
      content,
      tipo:      'example',
      categoria: 'ds-pattern',
      geografia: 'global',
      autor:     author || 'studio',
      prioridad: 'media',
    });

    // También guardar en disco si hay DS_REPO_PATH
    saveExampleFile(result.id, { id: result.id, brief, pattern, score, components, created_at: new Date().toISOString() });

    console.log(`  ✓ Example guardado: ${result.id}`);
    res.json({ ok: true, id: result.id, message: `Example guardado correctamente` });

  } catch (err) { next(err); }
});

// ─── POST /knowledge/save-template ───────────────────────────────────────────

router.post('/save-template', async function(req, res, next) {
  try {
    const { brief, components, pattern, name, author } = req.body;

    if (!brief || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'BadRequest', message: 'Campos requeridos: brief, components[]' });
    }

    const templateName = name || brief.substring(0, 50);
    const content = [
      `TEMPLATE: ${templateName}`,
      `Descripción: ${brief}`,
      `Pattern: ${pattern || 'unknown'}`,
      `Componentes: ${components.map(c => c.component).join(', ')}`,
    ].join('\n');

    const result = await kb.save({
      content,
      tipo:      'template',
      categoria: 'ds-pattern',
      geografia: 'global',
      autor:     author || 'studio',
      prioridad: 'baja',
    });

    console.log(`  ✓ Template guardado: ${result.id}`);
    res.json({ ok: true, id: result.id, message: `Template "${templateName}" guardado correctamente` });

  } catch (err) { next(err); }
});

// ─── POST /knowledge/ingest ───────────────────────────────────────────────────

router.post('/ingest', async function(req, res, next) {
  try {
    const { text, tipo, categoria, geografia, autor, prioridad } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo text es requerido' });
    }

    const result = await kb.save({
      content:   text.trim(),
      tipo:      tipo      || 'decision',
      categoria: categoria || 'recomendacion',
      geografia: geografia || 'global',
      autor:     autor     || 'equipo',
      prioridad: prioridad || 'media',
    });

    console.log(`  ✓ Conocimiento ingestado: ${result.id} [${tipo}/${categoria}]`);
    res.json({ ok: true, id: result.id, message: 'Conocimiento añadido correctamente' });

  } catch (err) { next(err); }
});

// ─── GET /knowledge/list ──────────────────────────────────────────────────────

router.get('/list', async function(req, res, next) {
  try {
    const { tipo } = req.query;
    // Búsqueda amplia para listar entradas recientes
    const entries = await kb.search('diseño componente pantalla regla decisión', {
      topK: 20,
      minScore: 0.0,
      ...(tipo ? { tipo } : {}),
    });
    res.json({ ok: true, total: entries.length, entries });
  } catch (err) { next(err); }
});

// ─── DELETE /knowledge/:id ────────────────────────────────────────────────────

router.delete('/:id', async function(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'BadRequest', message: 'ID requerido' });
    await kb.remove(id);
    console.log(`  ✓ Entrada eliminada: ${id}`);
    res.json({ ok: true, id, message: 'Entrada eliminada correctamente' });
  } catch (err) { next(err); }
});

module.exports = router;
