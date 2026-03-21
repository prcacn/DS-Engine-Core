// core/globalRulesParser.js
// Lee los archivos de engine/global-rules/*.md y extrae las reglas
// como objetos JavaScript ejecutables.
//
// FILOSOFÍA: Los .md son la fuente de verdad. El código los consume.
// Si un diseñador cambia una regla en el .md, la próxima composición
// ya la aplica — sin tocar código, sin deploy de lógica.
//
// Reglas soportadas actualmente:
//   - global-rules/navigation.md  → niveles L0-L3, variantes, nodeIds, tab-bar
//   - global-rules/singleton-rules.md → singletons, incompatibilidades, orden

const fs   = require('fs');
const path = require('path');

// Ruta base de global-rules relativa a este archivo
const GLOBAL_RULES_DIR = path.resolve(__dirname, '../../global-rules');

// ─── CACHÉ EN MEMORIA ─────────────────────────────────────────────────────────
// Las reglas se cargan una vez al arrancar. Si el archivo cambia en disco
// (p.ej. después de un git pull o deploy), llamar a invalidateCache() las recarga.

let _cache = null;
let _cacheLoadedAt = null;

function invalidateCache() {
  _cache = null;
  _cacheLoadedAt = null;
  console.log('  ↺ [GlobalRules] Caché invalidada — se recargará en la próxima llamada');
}

// ─── UTILIDADES DE PARSEO MARKDOWN ───────────────────────────────────────────

// Extrae todas las tablas markdown de un texto
// Devuelve array de arrays: [ [headers], [row1], [row2], ... ]
function extractTables(text) {
  const tables = [];
  const lines  = text.split('\n');
  let current  = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // Línea separadora (|---|---|) — ignorar
      if (/^[\|\s\-:]+$/.test(trimmed)) {
        continue;
      }
      const cells = trimmed
        .split('|')
        .slice(1, -1)
        .map(c => c.trim().replace(/\*\*/g, '').replace(/`/g, ''));

      if (!current) {
        current = { headers: cells, rows: [] };
      } else {
        current.rows.push(cells);
      }
    } else {
      if (current) {
        tables.push(current);
        current = null;
      }
    }
  }
  if (current) tables.push(current);
  return tables;
}

// Extrae el contenido de una sección por su título (## Título)
function extractSection(text, sectionTitle) {
  const lines    = text.split('\n');
  let inside     = false;
  let depth      = 0;
  const result   = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      if (title.includes(sectionTitle)) {
        inside = true;
        depth  = level;
        continue;
      }
      if (inside && level <= depth) {
        break; // siguiente sección del mismo nivel — salir
      }
    }
    if (inside) result.push(line);
  }
  return result.join('\n');
}

// ─── PARSER: navigation.md ────────────────────────────────────────────────────

function parseNavigationRules(mdText) {
  const rules = {
    // Mapa nivel → { headerVariant, tabBar, nodeId }
    levels: {},
    // Mapa intent/patrón → nivel
    intentToLevel: {},
    // Mapa variante → nodeId de Figma
    nodeIds: {},
    // Reglas textuales adicionales (para logging/debug)
    notes: [],
  };

  const tables = extractTables(mdText);

  for (const table of tables) {
    const headers = table.headers.map(h => h.toLowerCase());

    // Tabla 1: Niveles de navegación
    // Headers: Nivel | Descripción | Variante header | tab-bar
    if (headers.includes('nivel') && headers.includes('variante header')) {
      for (const row of table.rows) {
        const level   = row[0].replace(/[*]/g, '').trim(); // "L0", "L1", etc.
        const variant = row[2] ? row[2].split('+')[0].trim() : null; // "Type=Dashboard"
        const tabBar  = row[3] ? row[3].toLowerCase().includes('sí') : false;

        if (level && level !== '—' && level.match(/^L\d/)) {
          rules.levels[level] = {
            headerVariant: variant,
            tabBarAllowed: tabBar,
            description:   row[1] || '',
          };
        }
      }
    }

    // Tabla 2: Inferencia patrón → nivel
    // Headers: Patrón detectado | Nivel asignado | Motivo
    if (headers.includes('patrón detectado') || headers.includes('patron detectado')) {
      for (const row of table.rows) {
        const pattern = row[0].trim();
        const level   = row[1].trim();
        if (pattern && level) {
          rules.intentToLevel[pattern] = level;
        }
      }
    }

    // Tabla 3: Node IDs de Figma
    // Headers: Variante | Node ID
    if (headers.includes('variante') && headers.includes('node id')) {
      for (const row of table.rows) {
        const variant = row[0].trim();
        const nodeId  = row[1].trim();
        if (variant && nodeId) {
          rules.nodeIds[variant] = nodeId;
        }
      }
    }
  }

  return rules;
}

// ─── PARSER: singleton-rules.md ──────────────────────────────────────────────

function parseSingletonRules(mdText) {
  const rules = {
    // Componentes con límite estricto: { componentName: maxCount }
    singletons: {},
    // Componentes con límite flexible: { componentName: { max, condition } }
    flexible: {},
    // Pares incompatibles: [ [compA, compB], ... ]
    incompatibilities: [],
    // Orden de composición: [comp1, comp2, ...]
    compositionOrder: [],
  };

  const tables = extractTables(mdText);

  for (const table of tables) {
    const headers = table.headers.map(h => h.toLowerCase());

    // Tabla 1: Singletons estrictos
    // Headers: Componente | Máx. por pantalla | Qué hacer si hay duplicado
    if (headers.includes('componente') && headers.some(h => h.includes('máx'))) {
      for (const row of table.rows) {
        const comp = row[0].replace(/`/g, '').trim();
        const max  = parseInt(row[1], 10);
        if (comp && !isNaN(max)) {
          rules.singletons[comp] = max;
        }
      }
    }

    // Tabla 2: Incompatibilidades
    // Headers: Componente A | Componente B | Motivo
    if (headers.includes('componente a') && headers.includes('componente b')) {
      for (const row of table.rows) {
        const a = row[0].replace(/`/g, '').trim();
        const b = row[1].replace(/`/g, '').trim();
        if (a && b) {
          rules.incompatibilities.push([a, b]);
        }
      }
    }
  }

  // Extraer orden de composición de la sección "4. Reglas de orden"
  const orderSection = extractSection(mdText, 'Reglas de orden');
  const orderMatches = orderSection.match(/`([a-z-]+)`/g);
  if (orderMatches) {
    rules.compositionOrder = [...new Set(orderMatches.map(m => m.replace(/`/g, '')))];
  }

  return rules;
}

// ─── CARGADOR PRINCIPAL ───────────────────────────────────────────────────────

function loadGlobalRules() {
  if (_cache) {
    return _cache;
  }

  const result = {
    navigation:  null,
    singletons:  null,
    loadedAt:    null,
    errors:      [],
  };

  // Cargar navigation.md
  try {
    const navPath = path.join(GLOBAL_RULES_DIR, 'navigation.md');
    const navText = fs.readFileSync(navPath, 'utf-8');
    result.navigation = parseNavigationRules(navText);
    console.log(
      '  ✓ [GlobalRules] navigation.md cargado —',
      Object.keys(result.navigation.levels).length, 'niveles,',
      Object.keys(result.navigation.intentToLevel).length, 'patrones mapeados'
    );
  } catch (err) {
    result.errors.push('navigation.md: ' + err.message);
    console.error('  ✗ [GlobalRules] Error cargando navigation.md:', err.message);
  }

  // Cargar singleton-rules.md
  try {
    const singPath = path.join(GLOBAL_RULES_DIR, 'singleton-rules.md');
    const singText = fs.readFileSync(singPath, 'utf-8');
    result.singletons = parseSingletonRules(singText);
    console.log(
      '  ✓ [GlobalRules] singleton-rules.md cargado —',
      Object.keys(result.singletons.singletons).length, 'singletons,',
      result.singletons.incompatibilities.length, 'incompatibilidades'
    );
  } catch (err) {
    result.errors.push('singleton-rules.md: ' + err.message);
    console.error('  ✗ [GlobalRules] Error cargando singleton-rules.md:', err.message);
  }

  result.loadedAt = new Date().toISOString();
  _cache = result;
  _cacheLoadedAt = Date.now();

  return result;
}

// ─── API PÚBLICA ──────────────────────────────────────────────────────────────

// Devuelve el nivel de navegación para un intent_type dado
function getNavLevel(intentType) {
  const rules = loadGlobalRules();
  if (!rules.navigation) return 'L1'; // fallback seguro
  return rules.navigation.intentToLevel[intentType] || 'L1';
}

// Devuelve la variante del header para un nivel dado
function getHeaderVariant(level) {
  const rules = loadGlobalRules();
  if (!rules.navigation) return 'Type=Predeterminada';
  const levelData = rules.navigation.levels[level];
  return levelData ? levelData.headerVariant : 'Type=Predeterminada';
}

// Devuelve el nodeId de Figma para una variante dada
function getHeaderNodeId(variant) {
  const rules = loadGlobalRules();
  if (!rules.navigation) return '112:1853';
  return rules.navigation.nodeIds[variant] || '112:1853';
}

// Devuelve si el tab-bar está permitido para un nivel dado
function isTabBarAllowed(level) {
  const rules = loadGlobalRules();
  if (!rules.navigation) return false;
  const levelData = rules.navigation.levels[level];
  return levelData ? levelData.tabBarAllowed : false;
}

// Devuelve los singletons como mapa { componentName: maxCount }
function getSingletons() {
  const rules = loadGlobalRules();
  if (!rules.singletons) return {};
  return rules.singletons.singletons;
}

// Devuelve las incompatibilidades como array de pares [ [compA, compB] ]
function getIncompatibilities() {
  const rules = loadGlobalRules();
  if (!rules.singletons) return [];
  return rules.singletons.incompatibilities;
}

// Devuelve el orden de composición como array de nombres de componentes
function getCompositionOrder() {
  const rules = loadGlobalRules();
  if (!rules.singletons || !rules.singletons.compositionOrder.length) {
    // Fallback al orden hardcodeado anterior
    return [
      'navigation-header', 'notification-banner', 'list-header', 'filter-bar',
      'card-item', 'empty-state', 'input-text', 'button-primary',
      'button-secondary', 'modal-bottom-sheet', 'tab-bar'
    ];
  }
  return rules.singletons.compositionOrder;
}

// Devuelve las reglas completas (para debug o logging)
function getAllRules() {
  return loadGlobalRules();
}

module.exports = {
  loadGlobalRules,
  invalidateCache,
  getNavLevel,
  getHeaderVariant,
  getHeaderNodeId,
  isTabBarAllowed,
  getSingletons,
  getIncompatibilities,
  getCompositionOrder,
  getAllRules,
};
