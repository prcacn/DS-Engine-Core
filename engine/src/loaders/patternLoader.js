// loaders/patternLoader.js
// Lee los archivos .md de /patterns del DS
// y los parsea para que el Screen Planner pueda seleccionar el adecuado

const fs   = require('fs');
const path = require('path');

let cache = null;

function parsePattern(filename, content) {
  const name = filename.replace('.md', '');

  // Descripción
  const descMatch = content.match(/## Descripción\n([\s\S]*?)(?=\n##)/);
  const description = descMatch ? descMatch[1].trim() : '';

  // Cuándo aplicar
  const whenMatch = content.match(/## Cuándo aplicar este pattern\n([\s\S]*?)(?=\n##)/);
  const whenToApply = whenMatch
    ? whenMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  // Componentes requeridos — extraer lista numerada
  const reqMatch = content.match(/## Componentes requeridos.*?\n([\s\S]*?)(?=\n## Componentes opcionales|\n## Reglas)/);
  const requiredComponents = [];
  if (reqMatch) {
    const lines = reqMatch[1].trim().split('\n').filter(l => /^\d+\./.test(l));
    lines.forEach(line => {
      const clean = line.replace(/^\d+\.\s*/, '');
      const compMatch = clean.match(/^([a-z-]+)/);
      if (compMatch) {
        const nodeIdMatch = clean.match(/node_id:\s*([\w:]+)/);
        requiredComponents.push({
          component: compMatch[1],
          node_id: nodeIdMatch ? nodeIdMatch[1] : null,
          raw: clean
        });
      }
    });
  }

  // Componentes opcionales
  const optMatch = content.match(/## Componentes opcionales\n([\s\S]*?)(?=\n## Reglas|\n## Incomp)/);
  const optionalComponents = [];
  if (optMatch) {
    const lines = optMatch[1].trim().split('\n').filter(l => l.startsWith('-'));
    lines.forEach(line => {
      const clean = line.replace(/^- /, '');
      const compMatch = clean.match(/^([a-z-]+)/);
      if (compMatch) optionalComponents.push({ component: compMatch[1], raw: clean });
    });
  }

  // Reglas de composición
  const rulesMatch = content.match(/## Reglas de composición\n([\s\S]*?)(?=\n## Reglas de contenido|\n## Incomp|\n## Ejemplos)/);
  const compositionRules = rulesMatch
    ? rulesMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  // Incompatibilidades
  const incompMatch = content.match(/## Incompatibilidades\n([\s\S]*?)(?=\n##|$)/);
  const incompatibilities = incompMatch
    ? incompMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  return { name, description, whenToApply, requiredComponents, optionalComponents, compositionRules, incompatibilities };
}

function loadPatterns() {
  if (cache) return cache;

  const repoPath     = process.env.DS_REPO_PATH;
  const patternsPath = path.join(repoPath, 'patterns');

  if (!fs.existsSync(patternsPath)) {
    throw new Error(`Carpeta /patterns no encontrada en: ${patternsPath}`);
  }

  const files = fs.readdirSync(patternsPath).filter(f => f.endsWith('.md'));
  const patterns = {};

  files.forEach(filename => {
    const content = fs.readFileSync(path.join(patternsPath, filename), 'utf-8');
    const pattern = parsePattern(filename, content);
    patterns[pattern.name] = pattern;
  });

  console.log(`  ✓ Patterns cargados: ${Object.keys(patterns).join(', ')}`);
  cache = patterns;
  return patterns;
}

function clearCache() {
  cache = null;
}

module.exports = { loadPatterns, clearCache };
