// loaders/templateLoader.js
// Lee los archivos .md de /templates del DS
// y los parsea en objetos estructurados.
// Un template es una pantalla aprobada exacta, por nivel de navegación.
// Si existe un template para un intent, el engine lo usa directamente
// en lugar de generar desde cero.

const fs   = require('fs');
const path = require('path');

let cache = null;

function parseTemplate(filename, content) {
  const id = filename.replace('.md', '');

  // Nivel de navegación
  const levelMatch = content.match(/\*\*Nivel de navegación:\*\*\s*(L\d)/);
  const level = levelMatch ? levelMatch[1] : null;

  // Intent asociado
  const intentMatch = content.match(/\*\*Intent:\*\*\s*(.+)/);
  const intent = intentMatch ? intentMatch[1].trim() : null;

  // Keywords para matching
  const keywordsMatch = content.match(/\*\*Keywords:\*\*\s*(.+)/);
  const keywords = keywordsMatch
    ? keywordsMatch[1].split(',').map(k => k.trim().toLowerCase())
    : [];

  // Estado (aprobado / borrador)
  const statusMatch = content.match(/\*\*Estado:\*\*\s*(.+)/);
  const status = statusMatch ? statusMatch[1].trim() : 'borrador';

  // Score mínimo requerido
  const scoreMatch = content.match(/\*\*Score mínimo requerido:\*\*\s*(\d+)/);
  const minScore = scoreMatch ? parseInt(scoreMatch[1]) : 80;

  // Componentes requeridos — parsear tabla
  const compsMatch = content.match(/## COMPONENTES REQUERIDOS[\s\S]*?\n\|.*\|\n\|.*\|\n([\s\S]*?)(?=\n##)/);
  const components = [];
  if (compsMatch) {
    const lines = compsMatch[1].trim().split('\n').filter(l => l.startsWith('|'));
    lines.forEach((line, idx) => {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 3) {
        const nodeIdMatch = cols[2].match(/`([^`]+)`/);
        components.push({
          order:     idx,
          component: cols[1],
          node_id:   nodeIdMatch ? nodeIdMatch[1] : 'pending',
          variant:   cols[3] || 'default',
          notes:     cols[4] || '',
        });
      }
    });
  }

  // Restricciones
  const restrictMatch = content.match(/## RESTRICCIONES\n([\s\S]*?)(?=\n##|$)/);
  const restrictions = restrictMatch
    ? restrictMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  return {
    id,
    level,
    intent,
    keywords,
    status,
    minScore,
    components,
    restrictions,
    raw: content,
  };
}

function loadTemplates() {
  if (cache) return cache;

  const repoPath      = process.env.DS_REPO_PATH;
  // Buscar /templates en DS_REPO_PATH primero, luego junto al engine como fallback
  let templatesPath = path.join(repoPath, 'templates');
  if (!fs.existsSync(templatesPath)) {
    templatesPath = path.join(__dirname, '..', '..', 'templates');
  }
  if (!fs.existsSync(templatesPath)) {
    console.log('  ℹ [templates] Carpeta /templates no encontrada — sin templates aprobados');
    cache = {};
    return cache;
  }

  const files = fs.readdirSync(templatesPath).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    cache = {};
    return cache;
  }

  const templates = {};
  files.forEach(filename => {
    const content  = fs.readFileSync(path.join(templatesPath, filename), 'utf-8');
    const template = parseTemplate(filename, content);
    if (template.status === 'aprobado') {
      templates[template.id] = template;
    }
  });

  console.log(`  ✓ Templates cargados: ${Object.keys(templates).join(', ') || 'ninguno'}`);
  cache = templates;
  return cache;
}

// Buscar template por intent o por keywords del brief
function findTemplate(intent, brief) {
  const templates = loadTemplates();
  const briefLower = (brief || '').toLowerCase();

  // 1. Match exacto por intent
  const byIntent = Object.values(templates).find(t => t.intent === intent);
  if (byIntent) return byIntent;

  // 2. Match por keywords del brief
  const byKeyword = Object.values(templates).find(t =>
    t.keywords.some(kw => briefLower.includes(kw))
  );
  return byKeyword || null;
}

function clearCache() {
  cache = null;
}

module.exports = { loadTemplates, findTemplate, clearCache };
