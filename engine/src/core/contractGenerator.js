// engine/src/core/contractGenerator.js
// Genera los 3 archivos de registro de un componente nuevo:
//   1. contracts/{nombre}.md
//   2. Patch para spacingRegistry.js
//   3. Patch para figma-plugin/code.js
// Llamado desde POST /register

const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// ─── GENERAR DESCRIPCIÓN CON IA ───────────────────────────────────────────────
async function generateDescription(payload) {
  const { name, variants, height, width, tokens, properties } = payload;

  const prompt = `Eres un experto en Design Systems. Genera la documentación de un componente de UI para un DS fintech mobile.

Datos del componente:
- Nombre: ${name}
- Dimensiones: ${width}×${height}px
- Variantes: ${variants.map(v => v.name).join(', ')}
- Tokens vinculados: ${tokens.map(t => t.name).join(', ')}
- Propiedades Figma: ${properties.map(p => p.name).join(', ')}

Responde ÚNICAMENTE con un JSON válido:
{
  "descripcion": "1-2 frases describiendo qué es y para qué sirve",
  "cuando_usarlo": ["caso 1", "caso 2", "caso 3"],
  "cuando_no_usarlo": ["caso 1", "caso 2"],
  "restricciones": ["restricción 1", "restricción 2"],
  "zona": "header|content|bottom",
  "full_width": true|false,
  "singleton": true|false,
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}

zona: header=navegación fija arriba, bottom=fijo abajo (tab-bar, botones), content=todo lo demás
full_width: true si el componente ocupa todo el ancho de pantalla sin márgenes laterales
singleton: true si solo puede haber 1 por pantalla`;

  try {
    const resp = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = resp.content[0].text.trim().replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[contractGenerator] IA fallback:', err.message);
    return {
      descripcion: `Componente ${name} del Design System.`,
      cuando_usarlo: ['Según contexto de diseño'],
      cuando_no_usarlo: ['En formularios sin relación'],
      restricciones: ['Máximo 1 instancia si es singleton'],
      zona: 'content',
      full_width: true,
      singleton: false,
      keywords: [name],
    };
  }
}

// ─── GENERAR CONTRATO .md ─────────────────────────────────────────────────────
function generateContractMd(payload, aiData) {
  const { name, nodeId, variants, height, width, tokens, properties } = payload;

  const variantsTable = variants.length > 0
    ? variants.map(v => `| \`${v.name}\` | \`${v.nodeId}\` | ${v.width || width}×${v.height || height}px | — |`).join('\n')
    : `| \`default\` | \`${nodeId}\` | ${width}×${height}px | — |`;

  const propsTable = properties.length > 0
    ? properties.map(p => `| \`${p.name}\` | ${p.type || 'string'} | \`${p.defaultValue || ''}\` | Sí |`).join('\n')
    : `| — | — | — | — |`;

  const tokensTable = tokens.length > 0
    ? tokens.map(t => `| ${t.element || t.name} | \`${t.name}\` | ${t.value || '—'} |`).join('\n')
    : `| — | — | — |`;

  const whenToUse = aiData.cuando_usarlo.map(c => `- ${c}`).join('\n');
  const whenNotToUse = aiData.cuando_no_usarlo.map(c => `- ${c}`).join('\n');
  const restrictions = aiData.restricciones.map(r => `- ${r}`).join('\n');

  return `# ${name}

## Node ID en Figma
${nodeId}

## Descripción
${aiData.descripcion}

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
${variantsTable}

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
${propsTable}

---

## Tokens aplicados

| Elemento | Variable Figma | Valor |
|---|---|---|
${tokensTable}

---

## Cuándo usarlo
${whenToUse}

## Cuándo NO usarlo
${whenNotToUse}

---

## Restricciones
${restrictions}

---

## Zona en pantalla
\`${aiData.zona}\` — ${aiData.full_width ? 'ancho completo (sin márgenes laterales)' : 'con margen horizontal (16px)'}
${aiData.singleton ? '**Singleton:** máximo 1 por pantalla.' : '**Repetible:** puede aparecer N veces.'}

---

## Keywords para brief
${aiData.keywords.join(', ')}
`;
}

// ─── GENERAR PATCH spacingRegistry.js ────────────────────────────────────────
function generateSpacingPatch(payload, aiData) {
  const { name, nodeId, height } = payload;
  const gapAfter = aiData.zona === 'header' ? 0 : aiData.zona === 'bottom' ? 0 : 8;

  return {
    entryKey: name,
    entryCode: `
  '${name}': {
    nodeId:              '${nodeId}',
    height:              ${height},
    respectNativeHeight: true,
    resizeWidth:         ${aiData.full_width},
    gapAfter:            ${gapAfter},
    gapAfterToken:       'Gap/MD',
    zone:                '${aiData.zona}',
    singleton:           ${aiData.singleton},
  },`,
  };
}

// ─── GENERAR PATCH plugin/code.js ────────────────────────────────────────────
function generatePluginPatch(payload, aiData) {
  const { name, nodeId, height } = payload;

  return {
    componentNodeEntry: `  '${name}': '${nodeId}', // COMPONENT_SET`,
    heightMapEntry:     `  '${name}': ${height},`,
    fullWidthEntry:     aiData.full_width ? `  '${name}',` : null,
    isFullWidth:        aiData.full_width,
  };
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
async function generateAll(payload) {
  console.log(`  → [contractGenerator] Generando para: ${payload.name}`);

  const aiData = await generateDescription(payload);

  const contractMd      = generateContractMd(payload, aiData);
  const spacingPatch     = generateSpacingPatch(payload, aiData);
  const pluginPatch      = generatePluginPatch(payload, aiData);

  return {
    contractMd,
    spacingPatch,
    pluginPatch,
    aiData,
    meta: {
      name:      payload.name,
      nodeId:    payload.nodeId,
      generatedAt: new Date().toISOString(),
    },
  };
}

module.exports = { generateAll, generateDescription, generateContractMd };
