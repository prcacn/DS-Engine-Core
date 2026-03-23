// loaders/templateLoader.js
// Lee pantallas aprobadas desde /examples (fuente única).
// Reemplaza el sistema anterior de /templates con formato propio.
// Delega el parseo a variantParser.parseExampleMd para consistencia.

const { loadApprovedExamples, parseExampleMd } = require('../core/variantParser');

// Buscar ejemplo aprobado por intent o por keywords del brief
function findTemplate(intent, brief) {
  const examples = loadApprovedExamples();
  const briefLower = (brief || '').toLowerCase();

  // 1. Match exacto por patrón
  const byPattern = examples.find(e => e.pattern === intent);
  if (byPattern) return byPattern;

  // 2. Match por dominio en el brief
  const byDomain = examples.find(e =>
    e.domain && briefLower.includes(e.domain.toLowerCase())
  );
  if (byDomain) return byDomain;

  return null;
}

// Mantener compatibilidad — loadTemplates devuelve examples como mapa por id
function loadTemplates() {
  const examples = loadApprovedExamples();
  const map = {};
  examples.forEach(e => { map[e.id] = e; });
  return map;
}

function clearCache() {
  // El cache lo gestiona variantParser — no-op aquí
}

module.exports = { loadTemplates, findTemplate, clearCache };
