// core/knowledgeBase.js — Fase 4 (Pinecone Inference API + esquema catalogado)

const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone  = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = process.env.PINECONE_INDEX || 'ds-knowledge-base';

// ─── EMBEDDINGS — importado desde pineconeEmbed.js (fuente única) ────────────
// ⚠ NO redefinir embed aquí. Usar siempre pineconeEmbed.js
const { embed } = require('./pineconeEmbed');

// ─── GUARDAR CONOCIMIENTO ─────────────────────────────────────────────────────
async function save({ content, tipo = 'general', geografia = 'global', tags = [], autor = 'sistema', categoria = 'recomendacion', prioridad = 'media', expira = null }) {
  if (!content?.trim()) throw new Error('El contenido no puede estar vacío');

  // Filtrar si ha expirado
  if (expira && new Date(expira) < new Date()) {
    throw new Error('La fecha de expiración ya pasó — no se guarda');
  }

  const vector = await embed(content);
  const id     = 'kb-' + Date.now();
  const index  = pinecone.index(INDEX_NAME);

  await index.upsert([{
    id,
    values: vector,
    metadata: {
      content,
      tipo,
      geografia,
      tags:      Array.isArray(tags) ? tags.join(',') : tags,
      autor,
      categoria,   // restriccion | recomendacion | normativa | ds-pattern
      prioridad,   // alta | media | baja
      expira:    expira || '',
      fecha:     new Date().toISOString(),
    },
  }]);

  console.log('  → KB: guardado', id, '| categoria:', categoria, '| prioridad:', prioridad);
  return { id, content, tipo, geografia, categoria, prioridad, expira };
}

// ─── BUSCAR CONOCIMIENTO ──────────────────────────────────────────────────────
async function search(query, { geografia = null, tipo = null, categoria = null, prioridad = null, topK = 3, minScore = 0.70 } = {}) {
  const vector = await embed(query, 'query');
  const index  = pinecone.index(INDEX_NAME);

  const filter = {};
  if (geografia) filter.geografia = { $in: [geografia, 'global'] };
  if (tipo)      filter.tipo      = tipo;
  if (categoria) filter.categoria = categoria;
  if (prioridad) filter.prioridad = prioridad;

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
      // Filtrar expiradas
      if (m.metadata?.expira) return new Date(m.metadata.expira) > now;
      return true;
    })
    .map(m => ({
      id:        m.id,
      score:     m.score,
      text:      m.metadata?.text || m.metadata?.content || '',
      content:   m.metadata?.text || m.metadata?.content || '',
      tipo:      m.metadata?.tipo,
      geografia: m.metadata?.geografia,
      autor:     m.metadata?.autor,
      categoria: m.metadata?.categoria || 'recomendacion',
      prioridad: m.metadata?.prioridad || 'media',
      expira:    m.metadata?.expira    || null,
      fecha:     m.metadata?.fecha     || null,
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
