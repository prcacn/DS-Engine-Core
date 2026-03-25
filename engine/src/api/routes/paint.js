// api/routes/paint.js
// POST /paint
// Recibe una composición del engine (o un brief) y devuelve el código JS
// listo para ejecutar en figma_execute - FigmaPainter v3.1

const express   = require('express');
const router    = express.Router();
const { paint } = require('../../core/figmaPainter');

// POST /paint
// Body: { composition } - resultado directo de /generate
// O:    { brief, pattern, components, confidence } - composición parcial
// Options: { x, y, label }
router.post('/', (req, res, next) => {
  try {
    const { composition, x = 0, y = -175, label } = req.body;

    if (!composition && !req.body.components) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'Se requiere composition (respuesta de /generate) o components[]'
      });
    }

    // Aceptar composición directa o wrapper
    const comp = composition || req.body;

    if (!comp.components || comp.components.length === 0) {
      return res.status(400).json({
        error: 'BadRequest',
        message: 'La composición no tiene componentes'
      });
    }

    // Calcular posición X automática si no se proporciona
    // (Railway no tiene acceso al canvas de Figma, lo calcula el cliente)
    const painterCode = paint(comp, { x, y, label });

    res.json({
      status: 'ok',
      pattern: comp.pattern,
      components_count: comp.components.length,
      painter_version: '3.1',
      code: painterCode,
      // Metadata útil para el cliente
      meta: {
        x, y,
        estimated_height: _estimateHeight(comp.components),
        components: comp.components.map(c => ({
          component: c.component,
          node_id: c.node_id,
          order: c.order
        }))
      }
    });

  } catch (err) {
    next(err);
  }
});

function _estimateHeight(components) {
  const { COMPONENT_REGISTRY } = require('../../core/figmaPainter');
  return components.reduce((sum, c) => {
    const meta = COMPONENT_REGISTRY[c.component];
    return sum + (meta?.height || 56);
  }, 0);
}

module.exports = router;
