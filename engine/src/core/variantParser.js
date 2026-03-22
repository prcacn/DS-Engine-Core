// core/variantParser.js — Level 5.1
// Detecta si un brief es variante de una pantalla aprobada existente.
// Si lo es, extrae el delta (qué cambia respecto a la base).
//
// FLUJO:
//   brief → variantParser.detect() → { isVariant, baseId, base, delta }
//   si isVariant === true  → deltaEngine aplica el delta sobre la base
//   si isVariant === false → flujo normal (buildCompositionPlan)

const fs      = require('fs');
const path    = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// Ruta a los ejemplos aprobados
const EXAMPLES_DIR = path.resolve(__dirname, '../../examples');

// ─── CARGAR EJEMPLOS APROBADOS ────────────────────────────────────────────────

function loadApprovedExamples() {
  const examples = [];

  try {
    if (!fs.existsSync(EXAMPLES_DIR)) {
      console.warn('  ⚠ [VariantParser] /examples no encontrado en:', EXAMPLES_DIR);
      return examples;
    }

    const files = fs.readdirSync(EXAMPLES_DIR).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const raw  = fs.readFileSync(path.join(EXAMPLES_DIR, file), 'utf-8');
        const parsed = parseExampleMd(raw, file);
        if (parsed.status === 'APPROVED') {
          examples.push(parsed);
        }
      } catch (err) {
        console.warn('  ⚠ [VariantParser] Error leyendo', file, ':', err.message);
      }
    }

    console.log('  ✓ [VariantParser]', examples.length, 'bases aprobadas cargadas');
  } catch (err) {
    console.error('  ✗ [VariantParser] Error cargando examples:', err.message);
  }

  return examples;
}

// Parser básico de los .md de examples
function parseExampleMd(raw, filename) {
  const lines = raw.split('\n');
  const meta  = {};

  // Extraer frontmatter: **key:** value
  for (const line of lines) {
    const m = line.match(/^\*\*([^:]+):\*\*\s*(.+)/);
    if (m) meta[m[1].trim().toLowerCase()] = m[2].trim();
  }

  // Extraer título (primer # heading)
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine ? titleLine.replace(/^# /, '').trim() : filename;

  // Extraer componentes de la sección ## Componentes
  const compStart = lines.findIndex(l => l.trim() === '## Componentes');
  const components = [];
  if (compStart > -1) {
    for (let i = compStart + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('## ')) break;
      if (line.startsWith('- ')) {
        components.push(line.replace(/^- /, '').trim());
      }
    }
  }

  return {
    id:         filename.replace('.md', ''),
    title,
    pattern:    meta.pattern    || '',
    status:     meta.status     || '',
    score:      parseFloat(meta.score) || 0,
    domain:     meta.domain     || '',
    fecha:      meta.fecha      || '',
    components,
    raw,
  };
}

// ─── DETECTOR DE VARIANTE ─────────────────────────────────────────────────────

const DETECT_PROMPT = `Eres el VariantParser de un Design System IA-Ready.
Tu tarea: determinar si un brief describe una VARIANTE de una pantalla aprobada existente,
o si es una pantalla completamente nueva.

BASES APROBADAS DISPONIBLES:
{EXAMPLES}

BRIEF:
"{BRIEF}"

CRITERIOS para considerar que es una VARIANTE:
- El brief menciona explícitamente una base existente ("versión de login para...", "como el dashboard pero...")
- El brief describe una modificación concreta de algo ya aprobado ("añadir campo X", "cambiar el filtro de Y")
- El dominio y tipo de pantalla coinciden claramente con una base aprobada
- El brief pide una adaptación geográfica o de producto de algo ya existente

CRITERIOS para considerar que es NUEVA:
- El brief describe una pantalla que no existe en las bases
- El tipo de pantalla o dominio es diferente a todas las bases
- El brief es genérico sin referencia a algo existente

Responde ÚNICAMENTE con JSON válido:
{
  "is_variant": true | false,
  "base_id": "id del ejemplo base o null si no es variante",
  "confidence": número entre 0 y 1,
  "reasoning": "una frase explicando la decisión",
  "delta": {
    "add": ["descripción de componentes a añadir"],
    "remove": ["descripción de componentes a eliminar"],
    "modify": ["descripción de componentes a modificar"]
  }
}

Si is_variant es false, delta debe ser { "add": [], "remove": [], "modify": [] }.`;

async function detect(brief, examples) {
  if (!brief?.trim()) {
    return { isVariant: false, baseId: null, base: null, delta: null };
  }

  const approved = examples || loadApprovedExamples();

  if (approved.length === 0) {
    console.log('  → [VariantParser] Sin bases aprobadas — flujo normal');
    return { isVariant: false, baseId: null, base: null, delta: null };
  }

  // Construir lista de bases para el prompt
  const examplesText = approved.map(e =>
    `- ID: ${e.id} | Patrón: ${e.pattern} | Dominio: ${e.domain} | Título: ${e.title}`
  ).join('\n');

  const prompt = DETECT_PROMPT
    .replace('{EXAMPLES}', examplesText)
    .replace('{BRIEF}', brief);

  try {
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw    = response.content[0].text.trim();
    const clean  = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    if (result.is_variant && result.base_id) {
      const base = approved.find(e => e.id === result.base_id);
      if (!base) {
        console.log('  ⚠ [VariantParser] base_id no encontrado:', result.base_id);
        return { isVariant: false, baseId: null, base: null, delta: null };
      }

      console.log(
        '  ✓ [VariantParser] VARIANTE detectada | base:', result.base_id,
        '| conf:', result.confidence,
        '| delta: +' + result.delta.add.length +
        ' -' + result.delta.remove.length +
        ' ~' + result.delta.modify.length
      );

      return {
        isVariant:  true,
        baseId:     result.base_id,
        base,
        delta:      result.delta,
        confidence: result.confidence,
        reasoning:  result.reasoning,
      };
    }

    console.log('  → [VariantParser] NUEVA pantalla | conf:', result.confidence, '|', result.reasoning);
    return { isVariant: false, baseId: null, base: null, delta: null, reasoning: result.reasoning };

  } catch (err) {
    console.warn('  ⚠ [VariantParser] Error:', err.message, '— usando flujo normal');
    return { isVariant: false, baseId: null, base: null, delta: null };
  }
}

module.exports = { detect, loadApprovedExamples, parseExampleMd };
