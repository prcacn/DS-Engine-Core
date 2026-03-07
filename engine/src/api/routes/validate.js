// api/routes/validate.js
// POST /validate
// Valida si un conjunto de componentes cumple las reglas del DS

const express      = require('express');
const router       = express.Router();
const { loadContracts } = require('../../loaders/contractLoader');
const { loadPatterns }  = require('../../loaders/patternLoader');

router.post('/', (req, res, next) => {
  try {
    const { components, pattern } = req.body;

    if (!components || !Array.isArray(components) || components.length === 0) {
      return res.status(400).json({ error: 'BadRequest', message: 'El campo components (array) es requerido' });
    }

    const contracts    = loadContracts();
    const patterns     = loadPatterns();
    const errors       = [];
    const warnings     = [];

    // 1. Validar que cada componente existe en el DS
    components.forEach(c => {
      if (!contracts[c.component]) {
        errors.push({
          rule:      'component_exists',
          component: c.component,
          message:   `Componente '${c.component}' no existe en el DS`
        });
      }
    });

    // 2. Validar restricciones de multiplicidad
    const componentNames = components.map(c => c.component);
    const counts = {};
    componentNames.forEach(n => { counts[n] = (counts[n] || 0) + 1; });

    if ((counts['button-primary'] || 0) > 1) {
      errors.push({
        rule:    'max_1_primary_button',
        message: `Se encontraron ${counts['button-primary']} button-primary. Máximo permitido: 1`
      });
    }
    if ((counts['navigation-header'] || 0) > 1) {
      errors.push({
        rule:    'max_1_header',
        message: 'Solo puede haber 1 navigation-header por pantalla'
      });
    }
    if ((counts['filter-bar'] || 0) > 1) {
      errors.push({
        rule:    'max_1_filter_bar',
        message: 'Solo puede haber 1 filter-bar por pantalla'
      });
    }
    if ((counts['empty-state'] || 0) > 0 && (counts['card-item'] || 0) > 0) {
      errors.push({
        rule:    'empty_state_exclusivity',
        message: 'empty-state y card-item son mutuamente excluyentes en la misma pantalla'
      });
    }
    if ((counts['modal-bottom-sheet'] || 0) > 1) {
      warnings.push({
        rule:    'max_1_modal',
        message: 'Se recomienda no tener más de 1 modal abierto al mismo tiempo'
      });
    }

    // 3. Validar contra el pattern si se especifica
    if (pattern && patterns[pattern]) {
      const patternData = patterns[pattern];
      const requiredComponents = patternData.requiredComponents.map(r => r.component);

      // Componentes requeridos por el pattern que no están presentes
      requiredComponents.forEach(required => {
        if (!componentNames.includes(required)) {
          warnings.push({
            rule:      'pattern_required_component',
            component: required,
            message:   `El pattern '${pattern}' requiere '${required}' pero no está en la lista`
          });
        }
      });
    }

    // 4. Calcular score de conformidad
    const totalChecks  = 4 + (pattern ? 1 : 0);
    const failedChecks = errors.length;
    const score        = parseFloat(Math.max(0, (totalChecks - failedChecks) / totalChecks).toFixed(2));

    const response = {
      valid:    errors.length === 0,
      score,
      errors,
      warnings,
      summary: {
        components_checked: components.length,
        errors_count:       errors.length,
        warnings_count:     warnings.length,
        pattern_validated:  !!pattern
      }
    };

    console.log(`  ✓ Validación completada: ${errors.length} errores, ${warnings.length} warnings, score: ${score}`);
    res.json(response);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
