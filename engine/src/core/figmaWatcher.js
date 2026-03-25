// figmaWatcher.js
// F-01 - Flujo Inverso Automatizado
// Recibe y procesa webhooks de Figma detectando cambios relevantes para contratos
// Ruta: engine/src/core/figmaWatcher.js

const CONTRACT_RELEVANT_EVENTS = [
  'LIBRARY_PUBLISH',
  'FILE_VERSION_UPDATE',
];

// Clasificar impacto del cambio
// Devuelve: 'safe' | 'additive' | 'breaking'
function assessImpact(changeType) {
  if (changeType === 'COMPONENT_DELETED') return 'breaking';
  if (changeType === 'COMPONENT_CREATED') return 'additive';
  return 'safe';
}

// Verificar passcode del webhook
function verifyPasscode(received) {
  console.log(`[Watcher] Passcode recibido: "${received}" | Esperado: "${process.env.FIGMA_WEBHOOK_PASSCODE}"`);
  // Temporal: aceptar siempre para diagnostico
  return true;
}

// Extraer delta estructurado del payload de Figma
// Figma v2 usa: created_components, modified_components, deleted_components
function extractDelta(payload) {
  const delta = {
    fileKey: payload.file_key,
    fileName: payload.file_name,
    timestamp: new Date().toISOString(),
    eventType: payload.event_type,
    changes: [],
  };

  const created  = payload.created_components  || [];
  const modified = payload.modified_components || [];
  const deleted  = payload.deleted_components  || [];

  created.forEach(c => delta.changes.push({
    componentKey:  c.key,
    componentName: c.name,
    changeType:    'COMPONENT_CREATED',
    impact:        'additive',
  }));

  modified.forEach(c => delta.changes.push({
    componentKey:  c.key,
    componentName: c.name,
    changeType:    'COMPONENT_MODIFIED',
    impact:        'safe',
  }));

  deleted.forEach(c => delta.changes.push({
    componentKey:  c.key,
    componentName: c.name,
    changeType:    'COMPONENT_DELETED',
    impact:        'breaking',
  }));

  return delta;
}

// Filtrar solo cambios relevantes para contratos
function filterRelevant(delta) {
  if (!delta.changes || delta.changes.length === 0) return null;
  return delta;
}

// Handler principal - llamado desde la ruta Express
async function handleFigmaWebhook(req, res) {
  try {
    const payload = req.body;

    // 1. Verificar passcode
    if (!verifyPasscode(payload.passcode)) {
      console.warn('[Watcher] Passcode invalido - webhook rechazado');
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    // 2. Ignorar eventos no relevantes
    if (!CONTRACT_RELEVANT_EVENTS.includes(payload.event_type)) {
      return res.status(200).json({ status: 'ignored', reason: 'event_not_relevant' });
    }

    console.log(`[Watcher] Evento recibido: ${payload.event_type} -> file ${payload.file_key} (${payload.file_name})`);

    // 3. Extraer delta con estructura real de Figma v2
    const delta = extractDelta(payload);

    console.log(`[Watcher] Delta: ${delta.changes.filter(c => c.impact === 'breaking').length} breaking, ${delta.changes.filter(c => c.impact === 'additive').length} additive, ${delta.changes.filter(c => c.impact === 'safe').length} safe`);

    // 4. Filtrar cambios relevantes
    const relevantDelta = filterRelevant(delta);
    if (!relevantDelta) {
      return res.status(200).json({ status: 'ignored', reason: 'no_contract_relevant_changes' });
    }

    // 5. Procesar en background - no bloqueamos la respuesta a Figma
    setImmediate(async () => {
      try {
        const { processContractUpdate } = require('./contractUpdater');
        await processContractUpdate(relevantDelta);
      } catch (err) {
        console.error('[Watcher] Error procesando delta:', err.message);
      }
    });

    // 6. Responder a Figma inmediatamente (espera 200 en menos de 3s)
    return res.status(200).json({
      status:    'processing',
      changes:   relevantDelta.changes.length,
      breaking:  relevantDelta.changes.filter(c => c.impact === 'breaking').length,
      additive:  relevantDelta.changes.filter(c => c.impact === 'additive').length,
      safe:      relevantDelta.changes.filter(c => c.impact === 'safe').length,
      timestamp: relevantDelta.timestamp,
    });

  } catch (err) {
    console.error('[Watcher] Error inesperado:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
}

module.exports = { handleFigmaWebhook, extractDelta, filterRelevant, assessImpact };
