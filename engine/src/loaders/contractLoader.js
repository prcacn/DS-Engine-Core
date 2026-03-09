// loaders/contractLoader.js
// Lee los archivos .md de /contracts del repo del DS
// y los parsea en objetos estructurados para que el engine los consuma

const fs   = require('fs');
const path = require('path');

let cache = null; // Cache en memoria — se recarga si cambia el repo

function parseContract(filename, content) {
  const name = filename.replace('.md', '');

  // Extraer descripción (primer párrafo tras # título)
  const descMatch = content.match(/## Descripción\n([\s\S]*?)(?=\n##)/);
  const description = descMatch ? descMatch[1].trim() : '';

  // Extraer cuándo usarlo
  const whenMatch = content.match(/## Cuándo usarlo\n([\s\S]*?)(?=\n##)/);
  const whenToUse = whenMatch
    ? whenMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  // Extraer cuándo NO usarlo
  const whenNotMatch = content.match(/## Cuándo NO usarlo\n([\s\S]*?)(?=\n##)/);
  const whenNotToUse = whenNotMatch
    ? whenNotMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  // Extraer restricciones
  const restrictMatch = content.match(/## Restricciones\n([\s\S]*?)(?=\n##)/);
  const restrictions = restrictMatch
    ? restrictMatch[1].trim().split('\n').map(l => l.replace(/^- /, '').trim()).filter(Boolean)
    : [];

  // Extraer Node ID — soporta formato A (## Node ID en Figma) y formato B (figma_id en Metadata)
  const nodeIdMatchA = content.match(/## Node ID en Figma\n(.*)/);
  const nodeIdMatchB = content.match(/figma_id:\s*([\w:]+)/);
  const nodeId = (nodeIdMatchA ? nodeIdMatchA[1].trim() : null)
              || (nodeIdMatchB ? nodeIdMatchB[1].trim() : null)
              || 'pending';

  // Extraer propiedades de la tabla
  const propsMatch = content.match(/## Propiedades\n\|.*\|\n\|.*\|\n([\s\S]*?)(?=\n##)/);
  const properties = [];
  if (propsMatch) {
    const lines = propsMatch[1].trim().split('\n').filter(l => l.startsWith('|'));
    lines.forEach(line => {
      const cols = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 4) {
        properties.push({
          name:    cols[0],
          type:    cols[1],
          values:  cols[2],
          default: cols[3]
        });
      }
    });
  }

  return { name, description, whenToUse, whenNotToUse, restrictions, properties, nodeId, raw: content };
}

function loadContracts() {
  if (cache) return cache;

  const repoPath      = process.env.DS_REPO_PATH;
  const contractsPath = path.join(repoPath, 'contracts');

  if (!fs.existsSync(contractsPath)) {
    throw new Error(`Carpeta /contracts no encontrada en: ${contractsPath}`);
  }

  const files = fs.readdirSync(contractsPath).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    throw new Error(`No se encontraron contratos .md en: ${contractsPath}`);
  }

  const contracts = {};
  files.forEach(filename => {
    const content = fs.readFileSync(path.join(contractsPath, filename), 'utf-8');
    const contract = parseContract(filename, content);
    contracts[contract.name] = contract;
  });

  console.log(`  ✓ Contratos cargados: ${Object.keys(contracts).join(', ')}`);
  cache = contracts;
  return contracts;
}

function clearCache() {
  cache = null;
}

module.exports = { loadContracts, clearCache };
