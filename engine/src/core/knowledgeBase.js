// core/knowledgeBase.js - Fase 4 + Decision Model v2
// Actualizado para aceptar metadata estructurada desde approval-loop

const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone   = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = process.env.PINECONE_INDEX || 'ds-knowledge-base';

// ─── EMBEDDINGS - importado desde pineconeEmbed.js (fuente única) ────────────
// ⚠ NO redefinir embed aquí. Usar siempre pineconeEmbed.js
const { embed } = require('./pineconeEmbed');

// ─── GUARDAR CONOCIMIENTO ─────────────────────────────────────────────────────
async function save({
  content,
  tipo       = 'general',
  geografia  = 'global',
  tags       = [],
  autor      = 'sistema',
  categoria  = 'recomendacion',
  prioridad  = 'media',
  expira     = null,
  // Nuevo: metadata estructurada para trazabilidad de decisiones
  // Si viene, se mezcla con los campos base
  metadata   = {},
}) {
  if (!content?.trim()) throw new Error('El contenido no puede estar vacío');

  // Filtrar si ha expirado
  if (expira && new Date(expira) < new Date()) {
    throw new Error('La fecha de expiración ya pasó - no se guarda');
  }

  const vector = await embed(content);
  const id     = metadata.decision_id || ('kb-' + Date.now());
  const index  = pinecone.index(INDEX_NAME);

  // Campos base siempre presentes
  const baseMetadata = {
    content,
    tipo,
    geografia:  metadata.geo || geografia,
    tags:       Array.isArray(tags) ? tags.join(',') : tags,
    autor:      metadata.approved_by || metadata.rejected_by || autor,
    categoria,
    prioridad,
    expira:     expira || '',
    fecha:      metadata.date || new Date().toISOString(),
  };

  // Campos de decisión — solo se añaden si vienen informados
  // Pinecone ignora los campos undefined, pero los null pueden causar
  // problemas en algunos filtros — usamos string vacío como fallback
  const decisionMetadata = {
    decision_id:              metadata.decision_id              || '',
    action:                   metadata.action                   || '',
    screen_id:                metadata.screen_id                || '',
    base_id:                  metadata.base_id                  || '',
    pattern:                  metadata.pattern                  || '',
    brief:                    metadata.brief                    || '',
    project:                  metadata.project                  || '',
    segment:                  metadata.segment                  || '',
    domain:                   metadata.domain                   || '',
    modified_before_approval: metadata.modified_before_approval || false,
    modification_detail:      metadata.modification_detail      || '',
    reason:                   metadata.reason                   || '',
    source:                   metadata.source                   || '',
  };

  await index.upsert([{
    id,
    values: vector,
    metadata: {
      ...baseMetadata,
      ...decisionMetadata,
    },
  }]);

  console.log('  → KB: guardado', id, '| categoria:', categoria, '| prioridad:', prioridad, metadata.action ? '| action: ' + metadata.action : '');
  return { id, content, tipo, geografia: baseMetadata.geografia, categoria, prioridad, expira };
}

// ─── BUSCAR CONOCIMIENTO ──────────────────────────────────────────────────────
async function search(query, {
  geografia  = null,
  tipo       = null,
  categoria  = null,
  prioridad  = null,
  // Nuevos filtros opcionales por campos de decisión
  action     = null,
  project    = null,
  pattern    = null,
  geo        = null,
  topK       = 3,
  minScore   = 0.70,
} = {}) {
  const vector = await embed(query, 'query');
  const index  = pinecone.index(INDEX_NAME);

  const filter = {};
  if (geografia || geo) filter.geografia = { $in: [geografia || geo, 'global'] };
  if (tipo)             filter.tipo      = tipo;
  if (categoria)        filter.categoria = categoria;
  if (prioridad)        filter.prioridad = prioridad;
  if (action)           filter.action    = action;
  if (project)          filter.project   = project;
  if (pattern)          filter.pattern   = pattern;

  const results = await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
  });

  const now = new Date();
  const matches = (results.matches || [])
    .filter(m => m.score >= minScore)
    .filter(m => {
      if (m.metadata?.expira) return new Date(m.metadata.expira) > now;
      return true;
    })
    .map(m => ({
      id:                       m.id,
      score:                    m.score,
      content:                  m.metadata?.content || '',
      tipo:                     m.metadata?.tipo,
      geografia:                m.metadata?.geografia,
      autor:                    m.metadata?.autor,
      categoria:                m.metadata?.categoria          || 'recomendacion',
      prioridad:                m.metadata?.prioridad          || 'media',
      expira:                   m.metadata?.expira             || null,
      fecha:                    m.metadata?.fecha              || null,
      // Campos de decisión — disponibles si existen
      decision_id:              m.metadata?.decision_id        || null,
      action:                   m.metadata?.action             || null,
      screen_id:                m.metadata?.screen_id          || null,
      base_id:                  m.metadata?.base_id            || null,
      pattern:                  m.metadata?.pattern            || null,
      brief:                    m.metadata?.brief              || null,
      project:                  m.metadata?.project            || null,
      segment:                  m.metadata?.segment            || null,
      domain:                   m.metadata?.domain             || null,
      modified_before_approval: m.metadata?.modified_before_approval || false,
      modification_detail:      m.metadata?.modification_detail || null,
      reason:                   m.metadata?.reason             || null,
      source:                   m.metadata?.source             || null,
    }));

  console.log('  → KB: "' + query.substring(0, 50) + '" → ' + matches.length + ' resultados');
  return matches;
}

// ─── ELIMINAR ─────────────────────────────────────────────────────────────────
async function remove(id) {
  const index = pinecone.index(INDEX_NAME);
  await index.deleteOne(id);
  console.log('  → KB: eliminado', id);
  return { deleted: id };
}

module.exports = { save, search, remove };
