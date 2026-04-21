// engine/src/core/contractGenerator.js
// Genera documentación completa de contrato para cualquier componente del DS.
// Estructura unificada: 7 secciones obligatorias + hasta 6 opcionales según el componente.
// Llamado desde POST /register (plugin de Figma DS Register)

const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// Mapa de VariableIDs del Simple DS → token semántico + valor resuelto
const KNOWN_TOKENS = {
  'VariableID:22:491': { token: 'Text/Default/Default',        value: 'rgb(15,23,42)' },
  'VariableID:22:493': { token: 'Text/Neutral/Default',        value: 'rgb(100,116,139)' },
  'VariableID:22:473': { token: 'Text/Brand/Default',          value: 'rgb(79,70,229)' },
  'VariableID:22:475': { token: 'Background/Brand/Subtle',     value: 'brand/100' },
  'VariableID:22:477': { token: 'Background/Default/Default',  value: '#FFFFFF' },
  'VariableID:22:479': { token: 'Background/Neutral/Default',  value: 'neutral/300' },
  'VariableID:22:481': { token: 'Background/Neutral/Secondary', value: 'rgb(241,245,249)' },
  'VariableID:22:483': { token: 'Border/Default/Default',      value: '#E2E8F0' },
  'VariableID:22:485': { token: 'Background/Positive/Subtle',  value: 'green/100' },
  'VariableID:22:487': { token: 'Text/Positive/Default',       value: 'rgb(22,163,74)' },
  'VariableID:22:489': { token: 'Background/Danger/Subtle',    value: 'red/100' },
  'VariableID:22:495': { token: 'Text/Danger/Default',         value: 'rgb(220,38,38)' },
  'VariableID:22:497': { token: 'Background/Info/Subtle',      value: 'sky/100' },
  'VariableID:22:499': { token: 'Text/Info/Default',           value: 'sky/700' },
  'VariableID:22:501': { token: 'Background/Warning/Subtle',   value: 'amber/100' },
  'VariableID:22:503': { token: 'Text/Warning/Default',        value: 'amber/700' },
  'VariableID:22:505': { token: 'Background/Brand/Default',    value: 'rgb(79,70,229)' },
  'VariableID:22:507': { token: 'Text/Default/nochange',       value: '#FFFFFF' },
};

function resolveTokens(rawTokens) {
  if (!rawTokens || rawTokens.length === 0) return [];
  return rawTokens.map(t => {
    const known = KNOWN_TOKENS[t.name];
    return known
      ? { name: known.token, value: known.value, element: t.element, prop: t.prop }
      : { name: t.name, value: '-', element: t.element, prop: t.prop };
  });
}

// ─── GENERAR DOCUMENTACIÓN COMPLETA CON IA ───────────────────────────────────
async function generateDescription(payload) {
  const { name, variants, height, width, tokens, properties, nodeId, description } = payload;

  const resolvedTokens = resolveTokens(tokens);

  const variantsList = variants && variants.length > 0
    ? variants.map(v => `  - ${v.name} (nodeId: ${v.nodeId || nodeId}, ${v.width || width}×${v.height || height}px)`).join('\n')
    : '  - default';

  const tokensList = resolvedTokens.length > 0
    ? resolvedTokens.map(t => `  - ${t.element} [${t.prop}]: ${t.name} = ${t.value}`).join('\n')
    : '  - no especificados — inferir del nombre y tipo del componente';

  const propsList = properties && properties.length > 0
    ? properties.map(p => `  - ${p.name} (${p.type || 'string'}, default: "${p.defaultValue || ''}")`).join('\n')
    : '  - ninguna detectada';

  // Detectar señales para secciones opcionales
  const hasSlots = properties && properties.some(p =>
    p.type === 'TEXT' && (p.name.toLowerCase().includes('slot') || p.name.toLowerCase().includes('content'))
  );
  const hasNavigation = name.includes('button') || name.includes('tab') || name.includes('accordion') ||
    name.includes('link') || name.includes('nav') || name.includes('cta');
  const isInteractive = name.includes('button') || name.includes('input') || name.includes('toggle') ||
    name.includes('select') || name.includes('filter') || name.includes('accordion') || name.includes('feedback');
  const isComplex = variants && variants.length > 3;

  const prompt = `Eres el experto del Design System "Simple DS" — DS fintech mobile (390px) con tokens semánticos, DM Sans, brand indigo rgb(79,70,229), spacing 4/8/12/16/24px, radius 4/8/12px.

COMPONENTE A DOCUMENTAR:
- Nombre: ${name}
- Descripción del diseñador: ${description || "(no proporcionada — inferir del nombre y tokens)"}
- Node ID Figma: ${nodeId}
- Dimensiones: ${width}×${height}px
- Variantes detectadas:
${variantsList}
- Tokens vinculados (elemento · prop · token · valor):
${tokensList}
- Propiedades Figma:
${propsList}

SEÑALES DETECTADAS (úsalas para decidir qué secciones opcionales incluir):
- Tiene slots/contenido variable: ${hasSlots}
- Tiene navegación/CTA: ${hasNavigation}
- Es interactivo: ${isInteractive}
- Es complejo (>3 variantes): ${isComplex}

Responde ÚNICAMENTE con JSON válido. Sin texto, sin backticks, sin comentarios.

Genera el contrato completo con esta estructura.
Las secciones opcionales (slots_eventos, tokens_expuestos, navegacion, anotaciones, json_referencia, decisiones_tecnicas) solo inclúyelas si tienen contenido real y útil para este componente — no las generes vacías.

{
  "descripcion": "2-3 frases: qué es, para qué sirve, diferencial respecto a similares",

  "estructura_visual": "Diagrama ASCII real. Mostrar dimensiones, padding, zonas internas, tipografías. Usar ┌┐└┘│─",

  "variantes": [
    { "nombre": "nombre", "node_id": "id", "dimensiones": "${width}×${height}px", "uso": "cuándo usar esta variante" }
  ],

  "propiedades": [
    { "nombre": "prop", "tipo": "TEXT|enum|boolean", "default": "valor", "editable": true }
  ],

  "layout": {
    "layoutMode": "HORIZONTAL|VERTICAL",
    "paddingH": "16px → Spacing/Padding/Horizontal/MD",
    "paddingV": "12px → Spacing/Padding/Vertical/LG",
    "gap": "8px → Spacing/Gap/MD",
    "borderRadius": "8px → Spacing/Radius/Component/SM",
    "width": "390px (fill container)",
    "height": "${height}px"
  },

  "tokens_consumidos": [
    { "elemento": "nombre visual", "token_semantico": "Background/Default/Default", "valor": "#FFFFFF" }
  ],

  "cuando_usarlo": ["caso real 1", "caso real 2", "caso real 3"],
  "cuando_no_usarlo": ["caso — usar X en su lugar", "caso 2"],
  "restricciones": ["regla con número o condición concreta", "restricción 2"],

  "reglas_negocio": [
    { "regla": "nombre corto", "descripcion": "lógica de negocio real (dinámico, condición, mercado)" }
  ],

  "patrones": [
    { "patron": "nombre-patron", "posicion": "descripción", "repeticiones": "×1 o ×N" }
  ],

  "errores_frecuentes": [
    { "error": "descripción", "causa": "razón", "solucion": "cómo corregirlo" }
  ],

  "zona": "header|content|bottom",
  "full_width": true,
  "singleton": false,
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"],

  "slots_eventos": null,
  "tokens_expuestos": null,
  "navegacion": null,
  "anotaciones": null,
  "json_referencia": null,
  "decisiones_tecnicas": null
}

SECCIONES OPCIONALES — genera solo las que aplican, el resto déjalas en null:

slots_eventos (si es interactivo o tiene contenido variable):
{
  "slots": [{ "nombre": "nombre-slot", "descripcion": "contenido esperado" }],
  "eventos": [{ "nombre": "evento-emitido", "cuando": "condición de disparo", "payload": "datos que lleva" }]
}

tokens_expuestos (si es un componente que otros sobreescriben):
[{ "token": "--ds-nombre-token", "descripcion": "qué controla", "default": "valor" }]

navegacion (si tiene interacciones de navegación):
[{ "accion": "click en X", "destino": "pantalla o flujo destino" }]

anotaciones (notas UX críticas que no caben en restricciones):
[{ "target": "nombre del elemento o variante", "nota": "contexto UX importante" }]

json_referencia (para componentes complejos o templates):
{ "componentKey": "${nodeId}", "properties": {}, "textContent": {}, "repeat": null }

decisiones_tecnicas (solo si hay divergencia documentable respecto al contrato esperado):
[{ "decision": "qué se hizo diferente", "razon": "por qué", "alternativa": "qué se consideró" }]`;

  try {
    const resp = await getClient().messages.create({
      model: process.env.ANTHROPIC_MODEL_REGISTER || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = resp.content[0].text.trim().replace(/^```json\s*/,'').replace(/\s*```$/,'').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[contractGenerator] IA fallback:', err.message);
    const resolved = resolveTokens(tokens);
    return {
      descripcion: `Componente ${name} del Design System. Node ID: ${nodeId}.`,
      estructura_visual: `${width}px · ${height}px\n┌${'─'.repeat(38)}┐\n│ [${name}]${' '.repeat(Math.max(1, 38 - name.length - 2))}│\n└${'─'.repeat(38)}┘`,
      variantes: variants && variants.length > 0
        ? variants.map(v => ({ nombre: v.name, node_id: v.nodeId || nodeId, dimensiones: `${v.width||width}×${v.height||height}px`, uso: '-' }))
        : [{ nombre: 'default', node_id: nodeId, dimensiones: `${width}×${height}px`, uso: 'Variante estándar' }],
      propiedades: properties ? properties.map(p => ({ nombre: p.name, tipo: p.type || 'string', default: p.defaultValue || '—', editable: true })) : [],
      layout: { layoutMode: 'HORIZONTAL', paddingH: '16px → Spacing/Padding/Horizontal/MD', paddingV: '8px → Spacing/Padding/Vertical/MD', gap: '8px → Spacing/Gap/MD', borderRadius: '8px → Spacing/Radius/Component/SM', width: '390px (fill container)', height: `${height}px` },
      tokens_consumidos: resolved.length > 0 ? resolved.map(t => ({ elemento: t.element || t.name, token_semantico: t.name, valor: t.value })) : [],
      cuando_usarlo: ['Según contexto del componente'],
      cuando_no_usarlo: ['En contextos donde no aplica'],
      restricciones: ['Seguir las reglas del DS'],
      reglas_negocio: [],
      patrones: [],
      errores_frecuentes: [],
      zona: 'content', full_width: true, singleton: false,
      keywords: [name],
      slots_eventos: null, tokens_expuestos: null, navegacion: null,
      anotaciones: null, json_referencia: null, decisiones_tecnicas: null,
    };
  }
}

// ─── CONSTRUIR CONTRATO .md ───────────────────────────────────────────────────
function generateContractMd(payload, ai) {
  const { name, nodeId, width, height } = payload;

  const variantsTable = ai.variantes.map(v =>
    `| \`${v.nombre}\` | \`${v.node_id}\` | ${v.dimensiones} | ${v.uso} |`
  ).join('\n');

  const structureBlock = `\`\`\`\n${ai.estructura_visual}\n\`\`\``;

  const propsTable = ai.propiedades && ai.propiedades.length > 0
    ? ai.propiedades.map(p => `| \`${p.nombre}\` | ${p.tipo} | \`${p.default}\` | ${p.editable ? 'Sí' : 'No'} |`).join('\n')
    : '| — | — | — | — |';

  const l = ai.layout || {};
  const layoutTable = [
    `| layoutMode | ${l.layoutMode || 'HORIZONTAL'} |`,
    `| paddingLeft / Right | ${l.paddingH || '16px'} |`,
    `| paddingTop / Bottom | ${l.paddingV || '8px'} |`,
    `| gap | ${l.gap || '8px'} |`,
    `| borderRadius | ${l.borderRadius || '8px'} |`,
    `| width | ${l.width || `${width}px`} |`,
    `| height | ${l.height || `${height}px`} |`,
  ].join('\n');

  const tokensTable = ai.tokens_consumidos && ai.tokens_consumidos.length > 0
    ? ai.tokens_consumidos.map(t => `| ${t.elemento} | \`${t.token_semantico}\` | \`${t.valor}\` |`).join('\n')
    : '| — | — | — |';

  const whenToUse    = ai.cuando_usarlo.map(c => `- ${c}`).join('\n');
  const whenNotUse   = ai.cuando_no_usarlo.map(c => `- ${c}`).join('\n');
  const restrictions = ai.restricciones.map(r => `- ${r}`).join('\n');

  const businessRules = ai.reglas_negocio && ai.reglas_negocio.length > 0
    ? ai.reglas_negocio.map(r => `| ${r.regla} | ${r.descripcion} |`).join('\n')
    : null;

  const patternsTable = ai.patrones && ai.patrones.length > 0
    ? ai.patrones.map(p => `| \`${p.patron}\` | ${p.posicion} | ${p.repeticiones} |`).join('\n')
    : '| — | — | — |';

  const errorsTable = ai.errores_frecuentes && ai.errores_frecuentes.length > 0
    ? ai.errores_frecuentes.map(e => `| ${e.error} | ${e.causa} | ${e.solucion} |`).join('\n')
    : '| — | — | — |';

  const singletonLine = ai.singleton
    ? '**Singleton:** máximo 1 por pantalla.'
    : '**Repetible:** puede aparecer N veces.';

  const zonaDesc = { header: 'fijo en la parte superior', bottom: 'fijo en la parte inferior', content: 'zona de contenido principal' }[ai.zona] || 'zona de contenido';

  // Secciones opcionales
  let optionalSections = '';

  if (ai.slots_eventos) {
    const slotsRows = (ai.slots_eventos.slots || []).map(s => `| \`${s.nombre}\` | ${s.descripcion} |`).join('\n') || '| — | — |';
    const eventsRows = (ai.slots_eventos.eventos || []).map(e => `| \`${e.nombre}\` | ${e.cuando} | ${e.payload || '—'} |`).join('\n') || '| — | — | — |';
    optionalSections += `
---

## Slots

| Nombre | Contenido esperado |
|---|---|
${slotsRows}

## Eventos

| Evento | Cuándo se emite | Payload |
|---|---|---|
${eventsRows}`;
  }

  if (ai.tokens_expuestos && ai.tokens_expuestos.length > 0) {
    const exposedRows = ai.tokens_expuestos.map(t => `| \`${t.token}\` | ${t.descripcion} | \`${t.default}\` |`).join('\n');
    optionalSections += `
---

## Tokens expuestos (customización)

| Token | Qué controla | Default |
|---|---|---|
${exposedRows}`;
  }

  if (ai.navegacion && ai.navegacion.length > 0) {
    const navRows = ai.navegacion.map(n => `| ${n.accion} | ${n.destino} |`).join('\n');
    optionalSections += `
---

## Navegación

| Acción | Destino |
|---|---|
${navRows}`;
  }

  if (ai.anotaciones && ai.anotaciones.length > 0) {
    const annotRows = ai.anotaciones.map(a => `| ${a.target} | ${a.nota} |`).join('\n');
    optionalSections += `
---

## Anotaciones UX

| Elemento | Nota |
|---|---|
${annotRows}`;
  }

  if (ai.json_referencia) {
    optionalSections += `
---

## JSON de referencia

\`\`\`json
${JSON.stringify(ai.json_referencia, null, 2)}
\`\`\``;
  }

  if (ai.decisiones_tecnicas && ai.decisiones_tecnicas.length > 0) {
    const techRows = ai.decisiones_tecnicas.map(d => `| ${d.decision} | ${d.razon} | ${d.alternativa || '—'} |`).join('\n');
    optionalSections += `
---

## Decisiones técnicas

| Decisión | Razón | Alternativa considerada |
|---|---|---|
${techRows}`;
  }

  return `# ${name}

## Node ID en Figma
${nodeId}

## Descripción
${ai.descripcion}

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
${variantsTable}

---

## Estructura visual
${structureBlock}

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
${propsTable}

---

## Layout

| Propiedad | Valor |
|---|---|
${layoutTable}

---

## Tokens consumidos

| Elemento | Token semántico | Valor |
|---|---|---|
${tokensTable}

---

## Cuándo usarlo
${whenToUse}

## Cuándo NO usarlo
${whenNotUse}

---

## Restricciones
${restrictions}
${businessRules ? `
---

## Reglas de negocio

| Regla | Descripción |
|---|---|
${businessRules}` : ''}
---

## Uso en patrones

| Patrón | Posición | Repeticiones |
|---|---|---|
${patternsTable}

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
${errorsTable}
${optionalSections}
---

## Zona en pantalla
\`${ai.zona}\` — ${zonaDesc}
${singletonLine}

---

## Keywords para brief
${ai.keywords.join(', ')}
`;
}

// ─── GENERAR PATCH spacingRegistry.js ────────────────────────────────────────
function generateSpacingPatch(payload, ai) {
  const { name, nodeId, height } = payload;
  const gapAfter = ai.zona === 'header' ? 0 : ai.zona === 'bottom' ? 0 : 8;
  return {
    marker:   '  // [COMPONENT_REGISTRY_END]',
    entryKey: name,
    entryCode: `
  '${name}': {
    nodeId:              '${nodeId}',
    height:              ${height},
    respectNativeHeight: true,
    resizeWidth:         ${ai.full_width},
    gapAfter:            ${gapAfter},
    gapAfterToken:       'Gap/MD',
    zone:                '${ai.zona}',
    singleton:           ${ai.singleton},
  },`,
  };
}

// ─── GENERAR PATCH plugin/code.js ────────────────────────────────────────────
function generatePluginPatch(payload, ai) {
  const { name, nodeId, height } = payload;
  return {
    componentNodeEntry: `  '${name}': '${nodeId}', // COMPONENT_SET`,
    heightMapEntry:     `  '${name}': ${height},`,
    fullWidthEntry:     ai.full_width ? `  '${name}',` : null,
    isFullWidth:        ai.full_width,
  };
}


// ─── GENERAR PATCH figmaPainter.js ───────────────────────────────────────────
function generatePainterPatch(payload, ai) {
  const { name, nodeId, height, width } = payload;

  // Inferir slot desde zona
  const slotMap = {
    header:  'header',
    bottom:  'tab-bar',
    content: 'list-item',
  };
  const slot = slotMap[ai.zona] || 'content';

  // Inferir layout — si tiene grid o es card de cuentas
  const isGrid    = name.includes('account') || name.includes('card-grid');
  const isFullW   = ai.full_width;
  const hasMargin = !isFullW;

  // Construir texts desde propiedades editables
  const editableProps = (ai.propiedades || []).filter(p => p.editable && p.tipo === 'TEXT');
  const textsEntries  = editableProps.map(p => `'${p.nombre}': '${p.nombre}'`).join(', ');
  const textsBlock    = textsEntries ? `{ ${textsEntries} }` : '{}';

  const layoutBlock = isGrid
    ? `,
    layout: 'grid-horizontal', gridCols: 2, gridGap: 8`
    : '';

  const stickyBlock = ai.zona === 'header'
    ? `,
    sticky: 'top'`
    : ai.zona === 'bottom'
    ? `,
    sticky: 'bottom'`
    : '';

  const entryCode = `
  '${name}': {
    nodeId: '${nodeId}',
    texts: ${textsBlock},
    slot: '${slot}'${stickyBlock},
    ${isFullW ? 'fullWidth: true' : 'withMargin: true'},
    group: '${name.split('-')[0]}'${layoutBlock},
  },`;

  return {
    entryKey: name,
    entryCode,
    marker: "  // [PAINTER_META_END]",
  };
}

// ─── GENERAR PATCH screenRenderer.js ─────────────────────────────────────────
function generateRendererPatch(payload, ai) {
  const { name, nodeId, height, width } = payload;

  // camelCase: card-accounts -> renderCardAccounts
  const fnName = 'render' + name.split('-').map(function(w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join('');

  const editableProps = (ai.propiedades || []).filter(function(p) { return p.editable; });

  // Líneas de extracción de props — sin template literals anidados
  var propLines;
  if (editableProps.length > 0) {
    propLines = editableProps.map(function(p) {
      var fallback = (p.default && p.default !== '—') ? "'" + p.default + "'" : "'" + p.nombre + "'";
      var varName  = p.nombre.replace(/[^a-zA-Z0-9]/g, '_');
      return "  const " + varName + " = escHtml(prop(p, '" + p.nombre + "', " + fallback + "));";
    }).join('\n');
  } else {
    propLines = "  const label = escHtml(prop(p, 'label', ''));";
  }

  // HTML interno — sin template literals anidados
  var innerHtml;
  if (editableProps.length > 0) {
    innerHtml = editableProps.map(function(p) {
      var varName = p.nombre.replace(/[^a-zA-Z0-9]/g, '_');
      return '      <div class="ds-' + name + '__' + p.nombre + '">${' + varName + '}</div>';
    }).join('\n');
  } else {
    innerHtml = '      <div class="ds-' + name + '__content"></div>';
  }

  // CSS básico — sin template literals anidados
  var cssHeight = height || 56;
  var cssWidth  = ai.full_width ? 'width: 100%;' : 'padding: 0 var(--ds-pad-h);';
  var separator = '─'.repeat(Math.max(1, 44 - name.length));
  var cssEntry  = '\n/* ── ' + name.toUpperCase() + ' ' + separator + ' */\n'
    + '.ds-' + name + ' {\n'
    + '  display: flex;\n'
    + '  align-items: center;\n'
    + '  ' + cssWidth + '\n'
    + '  min-height: ' + cssHeight + 'px;\n'
    + '  background: var(--ds-color-bg);\n'
    + '  font-family: var(--ds-font);\n'
    + '}\n'
    + '.ds-' + name + '__content {\n'
    + '  flex: 1;\n'
    + '  font-size: var(--ds-size-body);\n'
    + '  color: var(--ds-color-text-primary);\n'
    + '}';

  // Función render — construida con concatenación, sin backticks anidados
  var renderFn = '\nfunction ' + fnName + '(comp) {\n'
    + '  const p = comp.props || {};\n'
    + propLines + '\n'
    + '  return `<div class="ds-' + name + '">\n'
    + innerHtml + '\n'
    + '  </div>`;\n'
    + '}';

  // Caso en el switch
  var switchCase = "    case '" + name + "':              return " + fnName + "(comp);";

  return {
    entryKey:     name,
    fnName:       fnName,
    renderFn:     renderFn,
    switchCase:   switchCase,
    cssEntry:     cssEntry,
    fnMarker:     '// [RENDERER_FNS_END]',
    switchMarker: '    // [RENDERER_SWITCH_END]',
    cssMarker:    '/* [DS_CSS_END] */',
  };
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
async function generateAll(payload) {
  console.log(`  → [contractGenerator] Generando documentación para: ${payload.name}`);
  const aiData        = await generateDescription(payload);
  const contractMd    = generateContractMd(payload, aiData);
  const spacingPatch  = generateSpacingPatch(payload, aiData);
  const pluginPatch   = generatePluginPatch(payload, aiData);
  const painterPatch  = generatePainterPatch(payload, aiData);
  const rendererPatch = generateRendererPatch(payload, aiData);
  return {
    contractMd, spacingPatch, pluginPatch,
    painterPatch, rendererPatch,
    aiData,
    meta: { name: payload.name, nodeId: payload.nodeId, generatedAt: new Date().toISOString() }
  };
}

module.exports = { generateAll, generateDescription, generateContractMd, generatePainterPatch, generateRendererPatch };
