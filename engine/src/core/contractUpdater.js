// contractUpdater.js
// F-02 - Actualiza contratos. Pendings van a GitHub para persistencia.
// Ruta: engine/src/core/contractUpdater.js

const { savePendingToGH } = require('./propagationEngine');

// Clasificar impacto global del delta
function classifyDelta(delta) {
  const hasBreaking = delta.changes.some(c => c.impact === 'breaking');
  const hasAdditive = delta.changes.some(c => c.impact === 'additive');
  if (hasBreaking) return 'breaking';
  if (hasAdditive) return 'additive';
  return 'safe';
}

// Procesar un delta completo
async function processContractUpdate(delta) {
  const classification = classifyDelta(delta);
  console.log(`[ContractUpdater] Clasificacion del delta: ${classification}`);

  for (const change of delta.changes) {
    if (change.impact === 'breaking') {
      // Breaking -> guardar en GitHub para revision
      console.warn(`[ContractUpdater] BREAKING: ${change.componentName} (${change.changeType}) - requiere revision manual`);

      await savePendingToGH({
        status:        'NEEDS_REVIEW',
        reason:        change.changeType,
        component:     change.componentName,
        componentKey:  change.componentKey,
        timestamp:     delta.timestamp,
        fileKey:       delta.fileKey,
        fileName:      delta.fileName,
      });

    } else if (change.changeType === 'COMPONENT_CREATED') {
      // Componente nuevo - log para seguimiento
      console.log(`[ContractUpdater] NUEVO componente detectado: ${change.componentName} - crear contrato manualmente`);

    } else {
      // Safe - log
      console.log(`[ContractUpdater] SAFE: ${change.componentName} (${change.changeType})`);
    }
  }

  console.log(`[ContractUpdater] Delta procesado. ${delta.changes.length} cambios.`);
}

module.exports = { processContractUpdate, classifyDelta };
