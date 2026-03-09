const express = require('express');
const router = express.Router();
const kb = require('../../core/knowledgeBase');

router.post('/add', async (req, res) => {
  try {
    const { content, tipo, geografia, tags, autor } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'El campo content es obligatorio' });
    }

    const result = await kb.save({
      id: `kb-${Date.now()}`,
      content,
      tipo: tipo || 'general',
      geografia: geografia || 'global',
      tags: tags || [],
      autor: autor || 'equipo',
      fecha: new Date().toISOString(),
    });

    res.json({ ok: true, message: 'Conocimiento guardado', ...result });

  } catch (error) {
    console.error('Error guardando conocimiento:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, geografia } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Parámetro q es obligatorio' });
    }

    const filter = geografia ? { geografia } : undefined;
    const results = await kb.search(q, { topK: 5, filter });

    res.json({ ok: true, results });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;