// core/knowledgeBase.js
// Base de conocimiento organizacional — DS IA-Ready Engine
// Usa embeddings locales (Xenova/multilingual-e5-small) + Pinecone como vector DB
// Sin dependencia de OpenAI ni otras APIs externas

const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Cache del modelo — se carga una sola vez y se reutiliza
let embedder = null;

async function getEmbedder() {
  if (embedder) return embedder;
  console.log('  → KB: cargando modelo de embeddings (primera vez, puede tardar)...');
  const { pipeline } = await import('@xenova/transformers');
  embedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  console.log('  → KB: modelo listo');
  return embedder;
}

// Convierte texto en vector de 384 dimensiones
async function embed(text) {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Guarda una pieza de conocimiento en Pinecone
async function save(entry) {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const vector = await embed(entry.content);

  await index.upsert([{
    id:     entry.id || `kb-${Date.now()}`,
    values: vector,
    metadata: {
      content:   entry.content,
      tipo:      entry.tipo      || 'general',
      geografia: entry.geografia || 'global',
      tags:      entry.tags      || [],
      autor:     entry.autor     || 'equipo',
      fecha:     entry.fecha     || new Date().toISOString(),
    }
  }]);

  console.log('  → KB: conocimiento guardado —', entry.tipo, '·', entry.geografia);
  return { ok: true, id: entry.id };
}

// Busca los fragmentos más relevantes para un brief dado
async function search(query, options = {}) {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const vector = await embed(query);

  const results = await index.query({
    vector,
    topK:            options.topK || 5,
    includeMetadata: true,
    filter:          options.filter || undefined,
  });

  return results.matches
    .filter(m => m.score > 0.75)
    .map(m => ({
      content:   m.metadata.content,
      tipo:      m.metadata.tipo,
      geografia: m.metadata.geografia,
      score:     m.score,
    }));
}

module.exports = { save, search };
