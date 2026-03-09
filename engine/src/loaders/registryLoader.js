// loaders/registryLoader.js
// Lee el archivo index.yaml del /registry del DS
// y lo mantiene en memoria para búsquedas semánticas rápidas

const fs   = require('fs');
const path = require('path');
const yaml = require('js-yaml');

let cache = null;

function loadRegistry() {
  if (cache) return cache;

  const repoPath     = process.env.DS_REPO_PATH;
  const registryPath = path.join(repoPath, 'registry', 'index.yaml');

  if (!fs.existsSync(registryPath)) {
    throw new Error(`Registry no encontrado en: ${registryPath}`);
  }

  const content = fs.readFileSync(registryPath, 'utf-8');
  const raw     = yaml.load(content);

  // Normalizar: si components es array, convertir a objeto keyed por name
  if (Array.isArray(raw.components)) {
    const map = {};
    for (const comp of raw.components) {
      const key = comp.name || comp.id;
      map[key] = { ...comp, intenciones: comp.intenciones || [], contextos: comp.category ? [comp.category] : [], node_id: comp.id };
    }
    raw.components = map;
  }

  console.log(`  ✓ Registry cargado: ${Object.keys(raw.components).length} componentes`);
  cache = raw;
  return raw;
}

// Busca componentes por intención usando coincidencia de texto simple
// En Fase 2 esto se mejorará con embeddings semánticos
function searchByIntent(query, context = null, limit = 5) {
  const registry = loadRegistry();
  const queryLower = query.toLowerCase();
  const results = [];

  for (const [componentName, data] of Object.entries(registry.components)) {
    let score = 0;

    // Coincidencia directa en intenciones
    for (const intencion of (data.intenciones || [])) {
      if (intencion.toLowerCase().includes(queryLower)) score += 3;
      if (queryLower.includes(intencion.toLowerCase())) score += 2;
      // Coincidencia parcial por palabras
      const words = queryLower.split(' ');
      for (const word of words) {
        if (word.length > 3 && intencion.toLowerCase().includes(word)) score += 1;
      }
    }

    // Bonus si el contexto coincide
    if (context && data.contextos) {
      for (const ctx of data.contextos) {
        if (ctx.toLowerCase().includes(context.toLowerCase())) score += 2;
      }
    }

    // Penalizar si el contexto está en excluir_en
    if (context && data.excluir_en) {
      for (const excl of data.excluir_en) {
        if (excl.toLowerCase().includes(context.toLowerCase())) score -= 5;
      }
    }

    if (score > 0) {
      results.push({
        component: componentName,
        relevance: Math.min(score / 10, 1).toFixed(2),
        intenciones: data.intenciones,
        contextos: data.contextos
      });
    }
  }

  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, limit);
}

function clearCache() {
  cache = null;
}

module.exports = { loadRegistry, searchByIntent, clearCache };
