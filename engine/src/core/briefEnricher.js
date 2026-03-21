// core/briefEnricher.js — Level 4.0
// Enriquece el brief con contexto organizacional de la KB ANTES de parseIntent.
//
// PROBLEMA QUE RESUELVE:
// Antes: brief → parseIntent → kbSearch → agentes
// Ahora: brief → kbSearch → enrichBrief → parseIntent → agentes
//
// Por qué importa: si la KB sabe que "fondos" tiene restricciones de acceso
// por perfil de riesgo, el intentParser debe saberlo ANTES de clasificar
// la pantalla. Sin este contexto, puede generar una lista de fondos sin
// tener en cuenta que el usuario podría no tener acceso.

const { search: kbSearch } = require('./knowledgeBase');

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────

const ENRICH_CONFIG = {
  topK:     5,       // reglas a recuperar de Pinecone
  minScore: 0.62,    // umbral de relevancia semántica
  // Categorías que aportan contexto real al intent parser
  // ds-pattern se excluye — es ruido para el enriquecimiento previo
  relevantCategories: ['restriccion', 'normativa', 'recomendacion'],
};

// ─── ENRIQUECEDOR PRINCIPAL ───────────────────────────────────────────────────

/**
 * Enriquece el brief con contexto organizacional relevante de la KB.
 * Devuelve el brief original + contexto inyectado como string,
 * más las reglas encontradas para pasarlas a los agentes sin repetir la búsqueda.
 *
 * @param {string} brief — brief original del diseñador
 * @returns {{ enrichedBrief: string, kbRules: array, hasContext: boolean }}
 */
async function enrichBriefWithKnowledge(brief) {
  if (!brief?.trim()) {
    return { enrichedBrief: brief, kbRules: [], hasContext: false };
  }

  let kbRules = [];

  try {
    kbRules = await kbSearch(brief, {
      topK:     ENRICH_CONFIG.topK,
      minScore: ENRICH_CONFIG.minScore,
    });
  } catch (err) {
    console.warn('  ⚠ [Enricher] KB no disponible — usando brief sin enriquecer:', err.message);
    return { enrichedBrief: brief, kbRules: [], hasContext: false };
  }

  // Filtrar solo categorías relevantes para el intent parser
  const relevantRules = kbRules.filter(r =>
    ENRICH_CONFIG.relevantCategories.includes(r.categoria)
  );

  if (relevantRules.length === 0) {
    console.log('  → [Enricher] Sin contexto KB relevante — brief sin modificar');
    return { enrichedBrief: brief, kbRules, hasContext: false };
  }

  // Construir el contexto a inyectar
  // Formato legible para Claude: prioridad alta primero
  const sorted = [...relevantRules].sort((a, b) => {
    const order = { alta: 0, media: 1, baja: 2 };
    return (order[a.prioridad] ?? 1) - (order[b.prioridad] ?? 1);
  });

  const contextLines = sorted.map(r =>
    `[${r.categoria.toUpperCase()} · ${r.prioridad}] ${r.content}`
  ).join('\n');

  // Brief enriquecido — el contexto va DESPUÉS del brief original
  // para no alterar la intención del diseñador, solo añadir restricciones
  const enrichedBrief = [
    brief.trim(),
    '',
    'CONTEXTO ORGANIZACIONAL (ten en cuenta estas reglas al clasificar la pantalla):',
    contextLines,
  ].join('\n');

  console.log(
    '  ✓ [Enricher] Brief enriquecido con ' + relevantRules.length +
    ' reglas KB (' + sorted.filter(r => r.prioridad === 'alta').length + ' alta prioridad)'
  );

  return {
    enrichedBrief,
    kbRules,       // todas las reglas (incluye ds-pattern) para los agentes
    hasContext: true,
  };
}

// ─── HELPER: extraer solo las reglas de alta prioridad ───────────────────────
// Útil para el intentParser cuando necesita saber si hay restricciones críticas

function extractHighPriorityRules(kbRules) {
  return (kbRules || []).filter(r => r.prioridad === 'alta' && r.categoria === 'restriccion');
}

module.exports = { enrichBriefWithKnowledge, extractHighPriorityRules };
