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
        const raw = line.replace(/^- /, '').trim();
        // Parsear "navigation-header (variant: Type=Modal, title: "Foo")" → objeto
        const nameMatch = raw.match(/^([a-z][a-z0-9\/\-]*)(?:\s|$|\s*×|\s*\()/);
        const compName  = nameMatch ? nameMatch[1] : null;
        if (!compName) continue;

        // Extraer variant
        const variantMatch = raw.match(/variant:\s*([^,)]+)/);
        const variant = variantMatch ? variantMatch[1].trim().replace(/['"]/g, '') : 'default';

        // Extraer props clave-valor simples
        const props = {};
        const titleMatch = raw.match(/title:\s*"([^"]+)"/);
        if (titleMatch) props.title = titleMatch[1];
        const labelMatch = raw.match(/label:\s*"([^"]+)"/);
        if (labelMatch) props.label = labelMatch[1];
        const actionMatch = raw.match(/action_label:\s*"([^"]+)"/);
        if (actionMatch) props.action_label = actionMatch[1];

        // Extraer quantity (×N)
        const qtyMatch = raw.match(/×(\d+)/);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;

        // Generar una entrada por cada instancia del componente
        for (let q = 0; q < quantity; q++) {
          components.push({
            component: compName,
            order:     components.length + 1,
            variant:   variant,
            props:     { ...props },
            required:  true,
            delta_action: 'base',
          });
        }
      }
    }
  }

  // ── Parsear sección ## Slots (nuevos templates con defaults por zona) ──────
  const slotsStart = lines.findIndex(l => l.trim() === '## Slots');
  const slots = { header: [], content: [], bottom: [] };
  let currentSlot = null;
  let currentComp = null;

  if (slotsStart > -1) {
    for (let i = slotsStart + 1; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) break; // siguiente sección

      // Detectar zona: ### header / ### content / ### bottom
      const zoneMatch = trimmed.match(/^###\s+(header|content|bottom)$/i);
      if (zoneMatch) { currentSlot = zoneMatch[1].toLowerCase(); currentComp = null; continue; }
      if (!currentSlot) continue;

      // Componente: línea que empieza con "- "
      if (trimmed.startsWith('- ') && !trimmed.startsWith('-   ') && !trimmed.startsWith('-  -')) {
        const raw = trimmed.replace(/^- /, '').trim();
        const nameMatch = raw.match(/^([a-z][a-z0-9\/\-]*)(?:\s|$|\s*×|\s*\()/);
        if (!nameMatch) continue;
        const compName = nameMatch[1];
        const variantMatch = raw.match(/variant:\s*([^,)]+)/);
        const variant = variantMatch ? variantMatch[1].trim().replace(/['"]/g, '') : 'default';
        const qtyMatch = raw.match(/×(\d+)/);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        const titleMatch = raw.match(/title:\s*"([^"]*)"/);
        const labelMatch = raw.match(/label:\s*"([^"]*)"/);
        const props = {};
        if (titleMatch) props.title = titleMatch[1];
        if (labelMatch) props.label = labelMatch[1];
        currentComp = { component: compName, variant, quantity, props, ai_overridable: true, default_props: {} };
        slots[currentSlot].push(currentComp);
        continue;
      }

      // Propiedades del componente actual: líneas indentadas con "  - "
      if (currentComp && (trimmed.startsWith('- ai_overridable:') || trimmed.startsWith('- default_props:') || trimmed.startsWith('- default_quantity:'))) {
        if (trimmed.startsWith('- ai_overridable:')) {
          const val = trimmed.replace('- ai_overridable:', '').trim();
          currentComp.ai_overridable = val !== 'false';
          // Extraer qué campos son overridable
          const fields = val.split(',').map(s => s.trim()).filter(s => s && s !== 'true' && s !== 'false' && !s.includes('('));
          if (fields.length > 0) currentComp.overridable_fields = fields;
          // Extraer rango de quantity si existe
          const rangeMatch = val.match(/min:\s*(\d+).*?max:\s*(\d+)/);
          if (rangeMatch) currentComp.quantity_range = { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
        }
        if (trimmed.startsWith('- default_props:')) {
          // Parsear props inline: { label: "X", placeholder: "Y" }
          const propsStr = trimmed.replace('- default_props:', '').trim();
          const titleM = propsStr.match(/title:\s*"([^"]*)"/);
          const labelM = propsStr.match(/label:\s*"([^"]*)"/);
          const placeholderM = propsStr.match(/placeholder:\s*"([^"]*)"/);
          const descM = propsStr.match(/description:\s*"([^"]*)"/);
          const confirmM = propsStr.match(/confirm_label:\s*"([^"]*)"/);
          const cancelM = propsStr.match(/cancel_label:\s*"([^"]*)"/);
          if (titleM) currentComp.default_props.title = titleM[1];
          if (labelM) currentComp.default_props.label = labelM[1];
          if (placeholderM) currentComp.default_props.placeholder = placeholderM[1];
          if (descM) currentComp.default_props.description = descM[1];
          if (confirmM) currentComp.default_props.confirm_label = confirmM[1];
          if (cancelM) currentComp.default_props.cancel_label = cancelM[1];
        }
      }
    }
  }

  // Si tiene slots, también extraer match_keywords del frontmatter
  const matchKeywords = meta.match_keywords
    ? meta.match_keywords.split(',').map(s => s.trim())
    : [];

  return {
    id:              filename.replace('.md', ''),
    title,
    pattern:         meta.pattern      || '',
    status:          meta.status       || '',
    score:           parseFloat(meta.score) || 0,
    domain:          meta.domain       || '',
    fecha:           meta.fecha        || '',
    nav_level:       meta.nav_level    || 'L1',
    match_keywords:  matchKeywords,
    has_slots:       slotsStart > -1,
    slots:           slotsStart > -1 ? slots : null,
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

CRITERIOS ESTRICTOS para considerar que es una VARIANTE (TODOS deben cumplirse):
1. El brief menciona EXPLÍCITAMENTE la base: "versión de login", "como el dashboard aprobado", "igual que X pero..."
2. El brief describe UN CAMBIO CONCRETO respecto a esa base: "con teléfono en lugar de email", "añadir campo X", "sin filtros"
3. El dominio y tipo de pantalla coinciden claramente con UNA base específica
4. NO es un brief genérico como "generar un dashboard" o "pantalla de login" sin más contexto

CRITERIOS para considerar que es NUEVA (cualquiera de estos es suficiente):
- El brief es genérico sin referenciar una base existente ("generar un dashboard", "pantalla de login")
- El brief no especifica qué cambia respecto a algo existente
- El tipo de pantalla o dominio es diferente a todas las bases
- El brief podría aplicarse a cualquier implementación, no a una específica

IMPORTANTE: La duda siempre va hacia NUEVA. Solo marca is_variant=true si hay certeza clara.

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

    // Umbral mínimo de confianza — por debajo de 0.80 se trata como pantalla nueva
    // Evita falsos positivos en briefs genéricos que coinciden superficialmente con una base
    const MIN_VARIANT_CONFIDENCE = 0.80;

    if (result.is_variant && result.base_id && result.confidence >= MIN_VARIANT_CONFIDENCE) {
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

    if (result.is_variant && result.confidence < MIN_VARIANT_CONFIDENCE) {
      console.log('  → [VariantParser] Confianza insuficiente (' + result.confidence + ' < 0.80) — flujo normal');
    } else {
      console.log('  → [VariantParser] NUEVA pantalla | conf:', result.confidence, '|', result.reasoning);
    }
    return { isVariant: false, baseId: null, base: null, delta: null, reasoning: result.reasoning };

  } catch (err) {
    console.warn('  ⚠ [VariantParser] Error:', err.message, '— usando flujo normal');
    return { isVariant: false, baseId: null, base: null, delta: null };
  }
}

module.exports = { detect, loadApprovedExamples, parseExampleMd };
