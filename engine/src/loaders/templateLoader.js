// loaders/templateLoader.js
// Lee pantallas aprobadas desde /examples.
// Con soporte para templates con slots y defaults ai_overridable.

const { loadApprovedExamples, parseExampleMd } = require('../core/variantParser');

// ── Buscar template por intent o keywords del brief ───────────────────────────
function findTemplate(intent, brief) {
  const examples = loadApprovedExamples();
  const briefLower = (brief || '').toLowerCase();

  // 1. Match exacto por id que incluya el intent (más específico primero)
  const byId = examples.find(e =>
    e.id.includes(intent.replace('lista-con-filtros','lista')) ||
    e.id.includes(intent.replace('formulario-simple','formulario'))
  );

  // 2. Match por patrón + keywords del brief
  const byKeywords = examples.find(e => {
    if (e.pattern !== intent) return false;
    if (!e.match_keywords || e.match_keywords.length === 0) return false;
    return e.match_keywords.some(kw => briefLower.includes(kw.toLowerCase()));
  });

  // 3. Match por patrón exacto (template genérico del patrón)
  const byPattern = examples.find(e => e.pattern === intent);

  // 4. Match por dominio en el brief
  const byDomain = examples.find(e =>
    e.domain && briefLower.includes(e.domain.toLowerCase())
  );

  return byKeywords || byId || byPattern || byDomain || null;
}

// ── Construir plan de composición desde slots + aplicar overrides del brief ───
// Los campos con ai_overridable: true se pueden sobrescribir desde el brief.
// Los campos con ai_overridable: false son fijos — el engine los respeta siempre.
function buildCompositionFromSlots(template, brief, quantities) {
  if (!template.has_slots || !template.slots) {
    // Template sin slots — devolver componentes directamente
    return template.components || [];
  }

  const components = [];
  let order = 1;
  const slots = template.slots;

  // Procesar zonas en orden: header → content → bottom
  for (const zone of ['header', 'content', 'bottom']) {
    const slotComps = slots[zone] || [];
    for (const slotComp of slotComps) {
      // Calcular cantidad real:
      // - Si ai_overridable y el brief tiene cantidad explícita → usar brief
      // - Si hay quantity_range → respetar min/max
      // - Si no → usar el default del template
      let count = slotComp.quantity || 1;

      if (slotComp.ai_overridable && quantities[slotComp.component]) {
        const requested = quantities[slotComp.component];
        if (slotComp.quantity_range) {
          count = Math.min(
            Math.max(requested, slotComp.quantity_range.min),
            slotComp.quantity_range.max
          );
        } else {
          count = Math.min(requested, 20);
        }
      }

      // Construir props: default_props del template + props del slot
      const baseProps = { ...slotComp.default_props, ...slotComp.props };

      for (let i = 0; i < count; i++) {
        components.push({
          slot:           zone,
          component:      slotComp.component,
          order:          order++,
          required:       true,
          variant:        slotComp.variant || 'default',
          props:          { ...baseProps },
          ai_overridable: slotComp.ai_overridable,
          quantity_index: count > 1 ? (i + 1) : null,
          from_template:  true,
        });
      }
    }
  }

  return components;
}

// ── loadTemplates — compatibilidad ────────────────────────────────────────────
function loadTemplates() {
  const examples = loadApprovedExamples();
  const map = {};
  examples.forEach(e => { map[e.id] = e; });
  return map;
}

function clearCache() {
  // El cache lo gestiona variantParser — no-op aquí
}

module.exports = { loadTemplates, findTemplate, buildCompositionFromSlots, clearCache };
