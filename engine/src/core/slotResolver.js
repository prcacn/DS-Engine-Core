// core/slotResolver.js
// Resuelve qué contenido va en cada slot de un componente compuesto.
// Lee el contrato de composición y usa Claude para decidir la combinación
// óptima de slots basándose en el brief e intent.

const Anthropic = require('@anthropic-ai/sdk');
const fs   = require('fs');
const path = require('path');

const client = new Anthropic();

const COMPOSITIONS_DIR = path.resolve(__dirname, '../../compositions');

// ─── CARGAR CONTRATO DE COMPOSICIÓN ──────────────────────────────────────────

function loadCompositionContract(name) {
  const filePath = path.join(COMPOSITIONS_DIR, name + '.md');
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf-8');
}

// ─── VARIANTES PREDEFINIDAS ───────────────────────────────────────────────────
// Para casos donde no hace falta llamar a Claude

const CARD_VARIANTS = {
  'card-simple':        { header: 'title',        content: 'text',       action: 'empty' },
  'card-action':        { header: 'title',        content: 'text',       action: 'button-primary' },
  'card-media':         { header: 'title+badge',  content: 'image+text', action: 'button-primary' },
  'card-metric':        { header: 'title+badge',  content: 'metrics',    action: 'link' },
  'card-profile':       { header: 'title+avatar', content: 'text',       action: 'button-secondary' },
  'card-list':          { header: 'title+icon',   content: 'list',       action: 'button-primary' },
  'card-double-action': { header: 'title',        content: 'text',       action: 'button-primary+button-secondary' },
};

// ─── PROMPT PARA RESOLVER SLOTS ───────────────────────────────────────────────

const SLOT_PROMPT = `Eres el SlotResolver de un Design System IA-Ready.
Tu tarea: dado un brief y un intent, decidir qué combinación de slots
usar para una card-composition.

BRIEF: "{BRIEF}"
DOMINIO: {DOMAIN}
INTENT: {INTENT}

VARIANTES DISPONIBLES:
{VARIANTS}

REGLAS:
- card-simple: solo texto, sin acciones. Para información estática.
- card-action: texto + botón principal. Para ítems accionables.
- card-media: imagen prominente + badge. Para productos visuales.
- card-metric: KPIs y datos numéricos. Para dashboards financieros.
- card-profile: con avatar. Para usuarios, entidades, gestores.
- card-list: lista de ítems cortos. Para features o características.
- card-double-action: dos opciones. Para confirmaciones o comparaciones.

Responde SOLO con JSON:
{
  "variant_id": "card-simple | card-action | card-media | card-metric | card-profile | card-list | card-double-action",
  "slots": {
    "header": { "type": "title | title+badge | title+avatar | title+icon", "title": "texto", "badge": "texto o null", "icon": "tipo o null" },
    "content": { "type": "text | image+text | metrics | list", "text": "texto", "items": [] },
    "action": { "type": "empty | button-primary | button-secondary | link | button-primary+button-secondary", "primary_label": "texto o null", "secondary_label": "texto o null", "link_label": "texto o null" }
  },
  "reasoning": "por qué esta variante"
}`;

// ─── RESOLVER PRINCIPAL ────────────────────────────────────────────────────────

async function resolveSlots({ brief, intent, compositionName = 'card-composition' }) {
  const variantsList = Object.entries(CARD_VARIANTS)
    .map(([id, slots]) => `- ${id}: header=${slots.header}, content=${slots.content}, action=${slots.action}`)
    .join('\n');

  const prompt = SLOT_PROMPT
    .replace('{BRIEF}',    brief || '')
    .replace('{DOMAIN}',   intent?.domain || 'general')
    .replace('{INTENT}',   intent?.intent_type || 'desconocido')
    .replace('{VARIANTS}', variantsList);

  try {
    const response = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 512,
      messages:   [{ role: 'user', content: prompt }],
    });

    const raw    = response.content[0].text.trim();
    const clean  = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    console.log('  ✓ [SlotResolver] variant:', result.variant_id, '|', result.reasoning?.slice(0, 60));
    return result;

  } catch (err) {
    console.warn('  ⚠ [SlotResolver] Error:', err.message, '- usando card-simple');
    return {
      variant_id: 'card-simple',
      slots: {
        header:  { type: 'title', title: intent?.domain || 'Elemento' },
        content: { type: 'text',  text: brief?.slice(0, 80) || '' },
        action:  { type: 'empty' },
      },
      reasoning: 'fallback',
    };
  }
}

// ─── CONVERTIR SLOTS A COMPONENTES ────────────────────────────────────────────
// Traduce la resolución de slots a un array de componentes
// que el engine puede pintar directamente

function slotsToComponents(slotResult, baseOrder = 1) {
  const comps = [];
  const slots = slotResult.slots;
  let order = baseOrder;

  // ── Header slot ─────────────────────────────────────────────────────────────
  const h = slots.header;
  comps.push({
    component:   'card-composition',
    slot:        'header',
    variant:     h.type,
    order:       order++,
    props: {
      title:     h.title     || '',
      badge:     h.badge     || null,
      icon:      h.icon      || null,
      has_avatar: h.type.includes('avatar'),
    },
    delta_action: 'base',
  });

  // ── Content slot ─────────────────────────────────────────────────────────────
  const c = slots.content;
  comps.push({
    component:   'card-composition',
    slot:        'content',
    variant:     c.type,
    order:       order++,
    props: {
      text:    c.text    || '',
      items:   c.items   || [],
      metrics: c.metrics || [],
    },
    delta_action: 'base',
  });

  // ── Action slot ──────────────────────────────────────────────────────────────
  const a = slots.action;
  if (a.type !== 'empty') {
    comps.push({
      component:    'card-composition',
      slot:         'action',
      variant:      a.type,
      order:        order++,
      props: {
        primary_label:   a.primary_label   || 'Ver más',
        secondary_label: a.secondary_label || null,
        link_label:      a.link_label      || null,
      },
      delta_action: 'base',
    });
  }

  return comps;
}

module.exports = { resolveSlots, slotsToComponents, loadCompositionContract, CARD_VARIANTS };
