// figmaWatcher.js
// F-01 - Flujo Inverso Automatizado
// Recibe y procesa webhooks de Figma detectando cambios relevantes para contratos
// Ruta: engine/src/core/figmaWatcher.js

const CONTRACT_RELEVANT_EVENTS = [
  'LIBRARY_PUBLISH',
  'FILE_VERSION_UPDATE',
];

// Propiedades que si cambian afectan al contrato
const CONTRACT_RELEVANT_PROPS = [
  'componentPropertyDefinitions',
  'description',
  'name',
];

// ─── Verificar passcode del webhook ──────────────────────────────────────
function verifyPasscode(received) {
  return received === process.env.FIGMA_WEBHOOK_PASSCODE;
}

// ─── Clasificar impacto del cambio ───────────────────────────────────────
// Devuelve: 'safe' | 'additive' | 'breaking'
function assessImpact(changeType, details = {}) {
  if (
    changeType === 'COMPONENT_DELETED' ||
    changeType === 'COMPONENT_RENAMED' ||
    details.action === 'REMOVED'
  ) return 'breaking';

  if (
    changeType === 'COMPONENT_CREATED' ||
    details.action === 'ADDED'
  ) return 'additive';

  return 'safe';
}

// ─── Extraer delta estructurado del payload de Figma ─────────────────────
// Figma no envía qué cambió exactamente - hay que comparar con la versión anterior
// En esta fase extraemos los componentes afectados para procesarlos después
function extractDelta(payload) {
  const delta = {
    fileKey: payload.file_key || payload.fileKey,
    timestamp: payload.timestamp || new Date().toISOString(),
    eventType: payload.event_type,
    changes: [],
  };

  // Figma LIBRARY_PUBLISH incluye created/modified/deleted
  if (payload.created) {
    payload.created.forEach(c => delta.changes.push({
      componentKey: c.key,
      componentName: c.name,
      changeType: 'COMPONENT_CREATED',
      impact: 'additive',
    }));
  }

  if (payload.modified) {
    payload.modified.forEach(c => delta.changes.push({
      componentKey: c.key,
      componentName: c.name,
      changeType: 'COMPONENT_MODIFIED',
      impact: assessImpact('COMPONENT_MODIFIED'),
    }));
  }

  if (payload.deleted) {
    payload.deleted.forEach(c => delta.changes.push({
      componentKey: c.key,
      componentName: c.name,
      changeType: 'COMPONENT_DELETED',
      impact: 'breaking',
    }));
  }

  return delta;
}

// ─── Filtrar solo cambios relevantes para contratos ──────────────────────
function filterRelevant(delta) {
  // Ignorar si no hay cambios de componentes
  if (!delta.changes || delta.changes.length === 0) return null;

  const relevant = delta.changes.filter(c =>
    ['COMPONENT_CREATED', 'COMPONENT_MODIFIED', 'COMPONENT_DELETED', 'COMPONENT_RENAMED'].includes(c.changeType)
  );

  if (relevant.length === 0) return null;

  return { ...delta, changes: relevant };
}

// ─── Handler principal - llamado desde la ruta Express ───────────────────
async function handleFigmaWebhook(req, res) {
  try {
    const payload = req.body;

    // 1. Verificar passcode
    if (!verifyPasscode(payload.passcode)) {
      console.warn('[Watcher] Passcode inválido - webhook rechazado');
      return res.status(401).json({ error: 'Invalid passcode' });
    }

    // 2. Ignorar eventos no relevantes
    if (!CONTRACT_RELEVANT_EVENTS.includes(payload.event_type)) {
      return res.status(200).json({ status: 'ignored', reason: 'event_not_relevant' });
    }

    console.log('[Watcher] Payload raw:', JSON.stringify(payload, null, 2));
    console.log(`[Watcher] Evento recibido: ${payload.event_type} → file ${payload.file_key}`);

    // 3. Extraer delta
    const delta = extractDelta(payload);

    // 4. Filtrar solo cambios relevantes para contratos
    const relevantDelta = filterRelevant(delta);
    if (!relevantDelta) {
      return res.status(200).json({ status: 'ignored', reason: 'no_contract_relevant_changes' });
    }

    console.log(`[Watcher] ${relevantDelta.changes.length} cambios relevantes detectados`);

    // 5. Emitir al contractUpdater de forma asíncrona
    // No bloqueamos la respuesta a Figma - procesamos en background
    setImmediate(async () => {
      try {
        const { processContractUpdate } = require('./contractUpdater');
        await processContractUpdate(relevantDelta);
      } catch (err) {
        console.error('[Watcher] Error procesando delta:', err.message);
      }
    });

    // 6. Responder a Figma inmediatamente (Figma espera 200 en <3s)
    return res.status(200).json({
      status: 'processing',
      changes: relevantDelta.changes.length,
      timestamp: relevantDelta.timestamp,
    });

  } catch (err) {
    console.error('[Watcher] Error inesperado:', err.message);
    return res.status(500).json({ error: 'Internal error' });
  }
}

module.exports = { handleFigmaWebhook, extractDelta, filterRelevant, assessImpact };
