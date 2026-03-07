// api/routes/registry.js
// GET /registry/search?q=...&context=...&limit=...
// Busca componentes por intención semántica

const express    = require('express');
const router     = express.Router();
const { searchByIntent, loadRegistry } = require('../../loaders/registryLoader');

// GET /registry/search
router.get('/search', (req, res, next) => {
  try {
    const { q, context, limit } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'BadRequest', message: 'Parámetro q (query) requerido' });
    }

    const results = searchByIntent(q.trim(), context || null, parseInt(limit) || 5);

    res.json({
      query:   q.trim(),
      context: context || null,
      total:   results.length,
      results
    });

  } catch (err) {
    next(err);
  }
});

// GET /registry/components — lista todos los componentes disponibles
router.get('/components', (req, res, next) => {
  try {
    const registry = loadRegistry();
    const components = Object.entries(registry.components).map(([name, data]) => ({
      name,
      intenciones_count: (data.intenciones || []).length,
      contextos:         data.contextos || [],
    }));

    res.json({ total: components.length, components });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
