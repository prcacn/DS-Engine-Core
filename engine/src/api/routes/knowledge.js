const express = require('express');
const router  = express.Router();
const kb      = require('../../core/knowledgeBase');

router.post('/add', async (req, res) => {
  try {
    const { content, tipo, geografia, tags, autor, categoria, prioridad, expira } = req.body;
    if (!content) return res.status(400).json({ error: 'El campo content es obligatorio' });
    const result = await kb.save({
      content,
      tipo:      tipo      || 'general',
      geografia: geografia || 'global',
      tags:      tags      || [],
      autor:     autor     || 'equipo',
      categoria: categoria || 'recomendacion',
      prioridad: prioridad || 'media',
      expira:    expira    || null,
    });
    res.json({ ok: true, message: 'Conocimiento guardado', ...result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, geografia, categoria, prioridad } = req.query;
    if (!q) return res.status(400).json({ error: 'Parámetro q es obligatorio' });
    const results = await kb.search(q, { geografia, categoria, prioridad, topK: 5 });
    res.json({ ok: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const results = await kb.search('design system reglas componentes pantallas', { topK: 20, minScore: 0 });
    res.json({ ok: true, total: results.length, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
