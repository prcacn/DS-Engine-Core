// contractUpdater.js
// F-02 - Actualiza el contrato JSON cuando llega un delta del Watcher
// Ruta: engine/src/core/contractUpdater.js

const fs = require('fs').promises;
const path = require('path');

const CONTRACTS_DIR = path.join(__dirname, '../../Simple/contracts');
const EXAMPLES_DIR  = path.join(__dirname, '../../Simple/examples');

// ─── Clasificar el impacto global del delta ───────────────────────────────
function classifyDelta(delta) {
  const hasBreaking = delta.changes.some(c => c.impact === 'breaking');
  const hasAdditive = delta.changes.some(c => c.impact === 'additive');
  if (hasBreaking) return 'breaking';
  if (hasAdditive) return 'additive';
  return 'safe';
}

// ─── Cargar contrato existente (si existe) ────────────────────────────────
async function loadContract(componentName) {
  const slug = componentName.toLowerCase().replace(/\s+/g, '-');
  const filePath = path.join(CONTRACTS_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return { contract: JSON.parse(raw), filePath, slug };
  } catch {
    return { contract: null, filePath, slug };
  }
}

// ─── Registrar en el log de cambios del engine ───────────────────────────
async function logChange(delta, classification, action) {
  const logPath = path.join(__dirname, '../../logs/contract-changes.jsonl');
  const entry = {
    timestamp: new Date().toISOString(),
    fileKey: delta.fileKey,
    classification,
    action,
    changes: delta.changes.map(c => ({
      component: c.componentName,
      type: c.changeType,
      impact: c.impact,
    })),
  };
  try {
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
  } catch (err) {
    console.warn('[ContractUpdater] No se pudo escribir el log:', err.message);
  }
}

// ─── Procesar un delta completo ───────────────────────────────────────────
async function processContractUpdate(delta) {
  const classification = classifyDelta(delta);
  console.log(`[ContractUpdater] Clasificación del delta: ${classification}`);

  for (const change of delta.changes) {
    const { contract, filePath, slug } = await loadContract(change.componentName);

    if (classification === 'breaking') {
      // Cambio breaking → NO actualizar automáticamente
      // Registrar para revisión manual y notificar
      console.warn(`[ContractUpdater] BREAKING: ${change.componentName} (${change.changeType}) - requiere revisión manual`);
      await logChange(delta, 'breaking', 'pending_review');

      // Crear archivo de propuesta para revisión
      const reviewPath = path.join(CONTRACTS_DIR, `_pending/${slug}.review.json`);
      await fs.mkdir(path.dirname(reviewPath), { recursive: true });
      await fs.writeFile(reviewPath, JSON.stringify({
        status: 'NEEDS_REVIEW',
        reason: change.changeType,
        component: change.componentName,
        componentKey: change.componentKey,
        timestamp: delta.timestamp,
        currentContract: contract,
      }, null, 2));

      console.log(`[ContractUpdater] Propuesta de revisión creada: ${reviewPath}`);

    } else if (change.changeType === 'COMPONENT_CREATED' && !contract) {
      // Componente nuevo sin contrato → crear contrato inicial
      const newContract = {
        id: slug,
        name: change.componentName,
        componentKey: change.componentKey,
        nodeId: null, // Se mapeará manualmente en el DS Simple
        source: 'figma-watcher',
        createdAt: delta.timestamp,
        status: 'DRAFT',
        variants: {},
        tokens: {},
        rules: [],
        notes: 'Contrato generado automáticamente por el flujo inverso. Requiere revisión.',
      };
      await fs.writeFile(filePath, JSON.stringify(newContract, null, 2));
      await logChange(delta, 'additive', 'contract_created');
      console.log(`[ContractUpdater] Contrato inicial creado: ${filePath}`);

    } else if (change.changeType === 'COMPONENT_MODIFIED' && contract) {
      // Componente modificado con contrato existente → actualizar metadata
      contract.lastModified = delta.timestamp;
      contract.componentKey = change.componentKey;
      contract.syncStatus = 'SYNCED';
      await fs.writeFile(filePath, JSON.stringify(contract, null, 2));
      await logChange(delta, 'safe', 'contract_updated');
      console.log(`[ContractUpdater] Contrato actualizado: ${filePath}`);

    } else if (change.changeType === 'COMPONENT_DELETED' && contract) {
      // Ya cubierto por breaking arriba, pero por si acaso
      contract.status = 'DEPRECATED';
      contract.deprecatedAt = delta.timestamp;
      await fs.writeFile(filePath, JSON.stringify(contract, null, 2));
      await logChange(delta, 'breaking', 'contract_deprecated');
      console.log(`[ContractUpdater] Contrato marcado como DEPRECATED: ${filePath}`);
    }
  }

  console.log(`[ContractUpdater] Delta procesado. ${delta.changes.length} cambios.`);
}

module.exports = { processContractUpdate, classifyDelta };
