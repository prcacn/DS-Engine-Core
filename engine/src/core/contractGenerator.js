// engine/src/core/contractGenerator.js
// Genera documentación completa de contrato para cualquier componente del DS.
// Llamado desde POST /register (plugin de Figma DS Register)

const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// Mapa de VariableIDs conocidos del Simple DS → token semántico + valor
const KNOWN_TOKENS = {
  'VariableID:22:491': { token: 'Text/Default/Default',        value: 'rgb(15,23,42)' },
  'VariableID:22:493': { token: 'Text/Neutral/Default',        value: 'rgb(100,116,139)' },
  'VariableID:22:473': { token: 'Text/Brand/Default',          value: 'rgb(79,70,229)' },
  'VariableID:22:475': { token: 'Background/Brand/Subtle',     value: 'brand/100' },
  'VariableID:22:477': { token: 'Background/Default/Default',  value: '#FFFFFF' },
  'VariableID:22:479': { token: 'Background/Neutral/Default',  value: 'neutral/300' },
  'VariableID:22:481': { token: 'Background/Neutral/Secondary','value': 'rgb(241,245,249)' },
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

// Resuelve los tokens crudos del plugin a nombres legibles
function resolveTokens(rawTokens) {
  if (!rawTokens || rawTokens.length === 0) return [];
  return rawTokens.map(t => {
    const known = KNOWN_TOKENS[t.name];
    if (known) {
      return { name: known.token, value: known.value, element: t.element, prop: t.prop };
    }
    return { name: t.name, value: '-', element: t.element, prop: t.prop };
  });
}

// ─── GENERAR DOCUMENTACIÓN COMPLETA CON IA ───────────────────────────────────
async function generateDescription(payload) {
  const { name, variants, height, width, tokens, properties, nodeId } = payload;

  const resolvedTokens = resolveTokens(tokens);

  const variantsList = variants && variants.length > 0
    ? variants.map(v => `${v.name} (nodeId: ${v.nodeId || nodeId}, ${v.width || width}×${v.height || height}px)`).join('\n    ')
    : 'default';

  const tokensList = resolvedTokens.length > 0
    ? resolvedTokens.map(t => `- ${t.element} [${t.prop}]: ${t.name} = ${t.value}`).join('\n    ')
    : 'no especificados — inferir del nombre y tipo del componente';

  const propsList = properties && properties.length > 0
    ? properties.map(p => `- ${p.name} (${p.type || 'string'}, default: "${p.defaultValue || ''}")`).join('\n    ')
    : 'ninguna detectada';

  const prompt = `Eres el experto del Design System "Simple DS" — un DS fintech mobile (390px) con tokens semánticos en español. Tu tarea: generar la documentación COMPLETA de un componente.

COMPONENTE A DOCUMENTAR:
- Nombre: ${name}
- Node ID Figma: ${nodeId}
- Dimensiones: ${width}×${height}px
- Variantes detectadas:
    ${variantsList}
- Tokens vinculados (elemento · propiedad · token · valor):
    ${tokensList}
- Propiedades Figma:
    ${propsList}

CONTEXTO DEL DS:
El Simple DS usa DM Sans, colores brand en indigo (rgb(79,70,229)), spacing de 4/8/12/16/24px, border-radius 4/8/12px. Los componentes siguen patrones mobile: navigation-header (singleton arriba), tab-bar (singleton abajo), card-item (filas de lista), button-primary (CTA único), filter-bar (chips bajo el header).

Responde ÚNICAMENTE con JSON válido. Sin texto, sin backticks, sin comentarios.

{
  "descripcion": "2-3 frases: qué es, para qué sirve y su diferencial respecto a componentes similares del DS",
  "estructura_visual": "Diagrama ASCII real del componente. Mostrar dimensiones externas, padding, zonas internas, etiquetas de tipografía. Usar ┌┐└┘│─",
  "variantes": [
    { "nombre": "nombre variante", "node_id": "id", "dimensiones": "${width}×${height}px", "uso": "cuándo usar esta variante" }
  ],
  "layout": {
    "layoutMode": "HORIZONTAL o VERTICAL",
    "paddingH": "16px → Spacing/Padding/Horizontal/MD",
    "paddingV": "12px → Spacing/Padding/Vertical/LG",
    "gap": "8px → Spacing/Gap/MD",
    "borderRadius": "8px → Spacing/Radius/Component/SM",
    "width": "390px (fill container)",
    "height": "${height}px"
  },
  "tokens": [
    { "elemento": "nombre visual", "token_semantico": "Background/Default/Default", "valor": "#FFFFFF" }
  ],
  "propiedades": [
    { "nombre": "prop", "tipo": "TEXT", "default": "valor", "editable": true }
  ],
  "cuando_usarlo": ["caso real y específico 1", "caso real 2", "caso real 3"],
  "cuando_no_usarlo": ["caso concreto — usar X en su lugar", "caso 2"],
  "restricciones": ["regla concreta con número o condición", "restricción 2"],
  "patrones": [
    { "patron": "nombre-patron", "posicion": "descripción de posición en ese patrón", "repeticiones": "×1 o ×N" }
  ],
  "errores_frecuentes": [
    { "error": "descripción del error", "causa": "razón", "solucion": "cómo corregirlo" }
  ],
  "zona": "header|content|bottom",
  "full_width": true,
  "singleton": false,
  "keywords": ["kw1", "kw2", "kw3", "kw4", "kw5"]
}`;

  try {
    const resp = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
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
      layout: { layoutMode: 'HORIZONTAL', paddingH: '16px → Spacing/Padding/Horizontal/MD', paddingV: '8px → Spacing/Padding/Vertical/MD', gap: '8px → Spacing/Gap/MD', borderRadius: '8px → Spacing/Radius/Component/SM', width: '390px (fill container)', height: `${height}px` },
      tokens: resolved.length > 0 ? resolved.map(t => ({ elemento: t.element || t.name, token_semantico: t.name, valor: t.value })) : [],
      propiedades: properties ? properties.map(p => ({ nombre: p.name, tipo: p.type || 'string', default: p.defaultValue || '—', editable: true })) : [],
      cuando_usarlo: ['Según contexto del componente'],
      cuando_no_usarlo: ['En contextos donde no aplica'],
      restricciones: ['Seguir las reglas del DS'],
      patrones: [],
      errores_frecuentes: [],
      zona: 'content',
      full_width: true,
      singleton: false,
      keywords: [name],
    };
  }
}

// ─── CONSTRUIR CONTRATO .md COMPLETO ─────────────────────────────────────────
function generateContractMd(payload, ai) {
  const { name, nodeId, width, height } = payload;

  const variantsTable = ai.variantes.map(v =>
    `| \`${v.nombre}\` | \`${v.node_id}\` | ${v.dimensiones} | ${v.uso} |`
  ).join('\n');

  const structureBlock = ai.estructura_visual
    ? `\`\`\`\n${ai.estructura_visual}\n\`\`\``
    : `\`\`\`\n${width}px · ${height}px\n┌──────────────────────────────────────┐\n│ [${name}] │\n└──────────────────────────────────────┘\n\`\`\``;

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

  const tokensTable = ai.tokens && ai.tokens.length > 0
    ? ai.tokens.map(t => `| ${t.elemento} | \`${t.token_semantico}\` | \`${t.valor}\` |`).join('\n')
    : '| — | — | — |';

  const whenToUse   = ai.cuando_usarlo.map(c => `- ${c}`).join('\n');
  const whenNotUse  = ai.cuando_no_usarlo.map(c => `- ${c}`).join('\n');
  const restrictions = ai.restricciones.map(r => `- ${r}`).join('\n');

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

## Tokens aplicados

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

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
async function generateAll(payload) {
  console.log(`  → [contractGenerator] Generando documentación completa para: ${payload.name}`);
  const aiData      = await generateDescription(payload);
  const contractMd  = generateContractMd(payload, aiData);
  const spacingPatch = generateSpacingPatch(payload, aiData);
  const pluginPatch  = generatePluginPatch(payload, aiData);
  return { contractMd, spacingPatch, pluginPatch, aiData, meta: { name: payload.name, nodeId: payload.nodeId, generatedAt: new Date().toISOString() } };
}

module.exports = { generateAll, generateDescription, generateContractMd };
