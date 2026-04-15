// engine/src/core/contractGenerator.js
// Genera documentación completa de contrato para cualquier componente del DS.
// Llamado desde POST /register (plugin de Figma DS Register)
//
// Estructura generada:
//   1. contracts/{nombre}.md  — contrato completo con estructura visual, variantes,
//      props, layout, tokens, cuándo usar, restricciones, patrones y errores frecuentes
//   2. Patch para spacingRegistry.js
//   3. Patch para figma-plugin/code.js

const Anthropic = require('@anthropic-ai/sdk');

let client = null;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

// ─── GENERAR DOCUMENTACIÓN COMPLETA CON IA ───────────────────────────────────
async function generateDescription(payload) {
  const { name, variants, height, width, tokens, properties, nodeId } = payload;

  const variantsList = variants.length > 0
    ? variants.map(v => `${v.name} (nodeId: ${v.nodeId || nodeId})`).join(', ')
    : 'default';

  const tokensList = tokens.length > 0
    ? tokens.map(t => `${t.name}: ${t.value || 'ver Figma'}`).join(', ')
    : 'no especificados';

  const propsList = properties.length > 0
    ? properties.map(p => `${p.name} (${p.type || 'string'}, default: ${p.defaultValue || '—'})`).join(', ')
    : 'ninguna';

  const prompt = `Eres un experto en Design Systems fintech mobile. Tu tarea es generar la documentación COMPLETA y DETALLADA de un componente de UI.

Datos del componente registrado desde Figma:
- Nombre: ${name}
- Node ID: ${nodeId}
- Dimensiones: ${width}×${height}px
- Variantes disponibles: ${variantsList}
- Tokens vinculados en Figma: ${tokensList}
- Propiedades Figma: ${propsList}

Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después. Sin backticks de markdown.

{
  "descripcion": "2-3 frases describiendo qué es, para qué sirve y cuándo el engine debe usarlo",
  "estructura_visual": "Diagrama ASCII de la estructura interna del componente. Mostrar dimensiones, padding, zonas internas y tipografías clave. Usar box-drawing chars como ┌┐└┘│─",
  "variantes": [
    {
      "nombre": "nombre de la variante",
      "node_id": "nodeId de la variante si se conoce, si no usar el principal",
      "dimensiones": "${width}×${height}px",
      "uso": "descripción concisa de cuándo usar esta variante"
    }
  ],
  "layout": {
    "layoutMode": "HORIZONTAL o VERTICAL",
    "paddingH": "valor en px + token de spacing",
    "paddingV": "valor en px + token de spacing",
    "gap": "valor en px + token de spacing",
    "borderRadius": "valor en px + token de spacing",
    "width": "fill container (390px) o auto o valor fijo",
    "height": "valor en px o auto"
  },
  "tokens": [
    {
      "elemento": "nombre del elemento visual (Fondo, Título, etc.)",
      "token_semantico": "nombre del token semántico del DS",
      "valor": "valor hex o rgb"
    }
  ],
  "propiedades": [
    {
      "nombre": "nombre de la propiedad",
      "tipo": "TEXT o enum o boolean",
      "default": "valor por defecto",
      "editable": true
    }
  ],
  "cuando_usarlo": ["caso de uso 1", "caso de uso 2", "caso de uso 3"],
  "cuando_no_usarlo": ["caso 1 con alternativa — usar X en su lugar", "caso 2"],
  "restricciones": ["restricción 1 (máximo, mínimo, regla de exclusividad, etc.)", "restricción 2"],
  "patrones": [
    {
      "patron": "nombre del patrón (lista-con-filtros, formulario-simple, confirmacion, detalle, dashboard, etc.)",
      "posicion": "descripción de dónde va en ese patrón",
      "repeticiones": "×1, ×N, etc."
    }
  ],
  "errores_frecuentes": [
    {
      "error": "descripción del error",
      "causa": "por qué ocurre",
      "solucion": "cómo corregirlo"
    }
  ],
  "zona": "header o content o bottom",
  "full_width": true,
  "singleton": false,
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Instrucciones clave:
- zona: header=fijo arriba (navigation-header, notification-banner), bottom=fijo abajo (tab-bar, buttons), content=todo lo demás
- full_width: true si ocupa 390px sin márgenes laterales
- singleton: true si solo puede haber 1 por pantalla (navigation-header, tab-bar, filter-bar, button-primary, modal-bottom-sheet, notification-banner)
- La estructura_visual debe reflejar la composición interna real basándote en las propiedades y tokens
- Los tokens deben usar nombres semánticos del DS (Background/Brand/Default, Text/Neutral/Default, etc.)
- Los patrones deben ser solo los relevantes: lista-con-filtros, formulario-simple, confirmacion, detalle, onboarding, perfil-usuario, error-estado, notificaciones, dashboard
- Genera entre 3-5 errores frecuentes reales, no genéricos`;

  try {
    const resp = await getClient().messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = resp.content[0].text.trim().replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[contractGenerator] IA fallback:', err.message);
    return {
      descripcion: `Componente ${name} del Design System. Registrado desde Figma con node_id ${nodeId}.`,
      estructura_visual: `${width}px · ${height}px\n┌${'─'.repeat(Math.min(width/4, 40))}┐\n│ [${name}] │\n└${'─'.repeat(Math.min(width/4, 40))}┘`,
      variantes: variants.length > 0
        ? variants.map(v => ({ nombre: v.name, node_id: v.nodeId || nodeId, dimensiones: `${width}×${height}px`, uso: '-' }))
        : [{ nombre: 'default', node_id: nodeId, dimensiones: `${width}×${height}px`, uso: 'Variante estándar' }],
      layout: {
        layoutMode: 'HORIZONTAL',
        paddingH: '16px → Spacing/Padding/Horizontal/MD',
        paddingV: '8px → Spacing/Padding/Vertical/MD',
        gap: '8px → Spacing/Gap/MD',
        borderRadius: '8px → Spacing/Radius/Component/SM',
        width: 'fill container (390px)',
        height: `${height}px`,
      },
      tokens: tokens.map(t => ({ elemento: t.name, token_semantico: t.name, valor: t.value || '-' })),
      propiedades: properties.map(p => ({ nombre: p.name, tipo: p.type || 'string', default: p.defaultValue || '—', editable: true })),
      cuando_usarlo: ['Según contexto de diseño del componente'],
      cuando_no_usarlo: ['En contextos donde no aplica este componente'],
      restricciones: ['Seguir las reglas del DS para este componente'],
      patrones: [],
      errores_frecuentes: [],
      zona: 'content',
      full_width: true,
      singleton: false,
      keywords: [name, name.replace('-', ' ')],
    };
  }
}

// ─── CONSTRUIR CONTRATO .md COMPLETO ─────────────────────────────────────────
function generateContractMd(payload, ai) {
  const { name, nodeId, width, height } = payload;

  // Tabla de variantes
  const variantsTable = ai.variantes.map(v =>
    `| \`${v.nombre}\` | \`${v.node_id}\` | ${v.dimensiones} | ${v.uso} |`
  ).join('\n');

  // Estructura visual
  const structureBlock = ai.estructura_visual
    ? `\`\`\`\n${ai.estructura_visual}\n\`\`\``
    : `\`\`\`\n${width}px · ${height}px\n┌──────────────────────────────────────┐\n│ [${name}] │\n└──────────────────────────────────────┘\n\`\`\``;

  // Tabla de propiedades
  const propsTable = ai.propiedades && ai.propiedades.length > 0
    ? ai.propiedades.map(p =>
        `| \`${p.nombre}\` | ${p.tipo} | \`${p.default}\` | ${p.editable ? 'Sí' : 'No'} |`
      ).join('\n')
    : '| — | — | — | — |';

  // Tabla de layout
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

  // Tabla de tokens
  const tokensTable = ai.tokens && ai.tokens.length > 0
    ? ai.tokens.map(t =>
        `| ${t.elemento} | \`${t.token_semantico}\` | \`${t.valor}\` |`
      ).join('\n')
    : '| — | — | — |';

  // Listas
  const whenToUse   = ai.cuando_usarlo.map(c => `- ${c}`).join('\n');
  const whenNotUse  = ai.cuando_no_usarlo.map(c => `- ${c}`).join('\n');
  const restrictions = ai.restricciones.map(r => `- ${r}`).join('\n');

  // Tabla de patrones
  const patternsTable = ai.patrones && ai.patrones.length > 0
    ? ai.patrones.map(p =>
        `| \`${p.patron}\` | ${p.posicion} | ${p.repeticiones} |`
      ).join('\n')
    : '| — | — | — |';

  // Tabla de errores frecuentes
  const errorsTable = ai.errores_frecuentes && ai.errores_frecuentes.length > 0
    ? ai.errores_frecuentes.map(e =>
        `| ${e.error} | ${e.causa} | ${e.solucion} |`
      ).join('\n')
    : '| — | — | — |';

  const singletonLine = ai.singleton
    ? '**Singleton:** máximo 1 por pantalla.'
    : '**Repetible:** puede aparecer N veces.';

  const zonaDesc = {
    header: 'fijo en la parte superior de la pantalla',
    bottom: 'fijo en la parte inferior de la pantalla',
    content: 'zona de contenido principal (scroll)',
  }[ai.zona] || 'zona de contenido';

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

  const aiData       = await generateDescription(payload);
  const contractMd   = generateContractMd(payload, aiData);
  const spacingPatch  = generateSpacingPatch(payload, aiData);
  const pluginPatch   = generatePluginPatch(payload, aiData);

  return {
    contractMd,
    spacingPatch,
    pluginPatch,
    aiData,
    meta: {
      name:        payload.name,
      nodeId:      payload.nodeId,
      generatedAt: new Date().toISOString(),
    },
  };
}

module.exports = { generateAll, generateDescription, generateContractMd };
