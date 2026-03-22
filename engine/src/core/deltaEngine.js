// core/deltaEngine.js — Level 5.2
// Aplica el delta sobre una base aprobada y genera la composición propuesta.
// No pinta en Figma — genera una PROPUESTA que el diseñador valida primero.
//
// OUTPUT:
//   {
//     proposal:   components[],   // composición resultante
//     diff:       { added, removed, modified },  // qué cambió respecto a la base
//     base_id:    string,
//     is_proposal: true           // indica que requiere validación antes de pintar
//   }

const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic();

const DELTA_PROMPT = `Eres el DeltaEngine de un Design System IA-Ready.
Tu tarea: aplicar un delta sobre una pantalla base aprobada para generar una variante.

BASE APROBADA (componentes actuales):
{BASE_COMPONENTS}

DELTA SOLICITADO:
- Añadir: {ADD}
- Eliminar: {REMOVE}
- Modificar: {MODIFY}

BRIEF ORIGINAL:
"{BRIEF}"

CONTRATOS DISPONIBLES:
{CONTRACTS}

Tu tarea: genera la lista de componentes resultante después de aplicar el delta.
Mantén todos los componentes de la base que no se modifican ni eliminan.
Para los componentes nuevos o modificados, infiere las props correctas del brief.

Responde ÚNICAMENTE con JSON válido:
{
  "components": [
    {
      "component": "nombre-componente",
      "order": número,
      "variant": "variante",
      "props": { "prop": "valor" },
      "delta_action": "base | added | modified | removed"
    }
  ],
  "diff_summary": {
    "added":    ["descripción de lo añadido"],
    "removed":  ["descripción de lo eliminado"],
    "modified": ["descripción de lo modificado"]
  },
  "reasoning": "explicación del resultado en 1-2 frases"
}`;

async function apply({ base, delta, brief, contracts }) {
  if (!base || !delta) {
    throw new Error('DeltaEngine: base y delta son obligatorios');
  }

  // Serializar componentes de la base
  const baseComponents = base.components.join('\n');

  // Serializar contratos disponibles (solo nombres y variantes)
  const contractList = Object.keys(contracts || {})
    .map(k => `- ${k}`)
    .join('\n') || '(sin contratos disponibles)';

  const prompt = DELTA_PROMPT
    .replace('{BASE_COMPONENTS}', baseComponents)
    .replace('{ADD}',    delta.add?.join(', ')    || 'ninguno')
    .replace('{REMOVE}', delta.remove?.join(', ') || 'ninguno')
    .replace('{MODIFY}', delta.modify?.join(', ') || 'ninguno')
    .replace('{BRIEF}',  brief)
    .replace('{CONTRACTS}', contractList);

  try {
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw    = response.content[0].text.trim();
    const clean  = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    // Separar componentes por acción para el diff visual
    const added    = result.components.filter(c => c.delta_action === 'added');
    const removed  = result.components.filter(c => c.delta_action === 'removed');
    const modified = result.components.filter(c => c.delta_action === 'modified');
    const kept     = result.components.filter(c => c.delta_action === 'base');

    // Los removed no van en la composición final
    const proposal = result.components
      .filter(c => c.delta_action !== 'removed')
      .sort((a, b) => a.order - b.order);

    console.log(
      '  ✓ [DeltaEngine] Propuesta generada | base:', base.id,
      '| +' + added.length + ' -' + removed.length + ' ~' + modified.length + ' =' + kept.length
    );

    return {
      proposal,
      diff: {
        added:    added.map(c => ({ component: c.component, props: c.props })),
        removed:  removed.map(c => ({ component: c.component })),
        modified: modified.map(c => ({ component: c.component, props: c.props })),
      },
      diff_summary:  result.diff_summary,
      base_id:       base.id,
      base_title:    base.title,
      is_proposal:   true,
      reasoning:     result.reasoning,
    };

  } catch (err) {
    console.error('  ✗ [DeltaEngine] Error:', err.message);
    throw err;
  }
}

module.exports = { apply };
