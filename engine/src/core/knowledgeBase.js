async function embed(text) {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  const vector = Array.from(output.data);
  if (!vector || vector.length === 0) {
    throw new Error('El modelo no generó un vector válido');
  }
  console.log('  → KB: vector generado, dimensiones:', vector.length);
  return vector;
}

const { Pinecone } = require('@pinecone-database/pinecone');

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

let embedder = null;

async function getEmbedder() {
  if (embedder) return embedder;
  console.log('  → KB: cargando modelo de embeddings...');
  const { pipeline } = await import('@xenova/transformers');
  embedder = await pipeline('feature-extraction', 'Xenova/multilingual-e5-small');
  console.log('  → KB: modelo listo');
  return embedder;
}

async function embed(text) {
  const pipe = await getEmbedder();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  const vector = [...output.data];
  console.log('  → KB: vector dimensiones:', vector.length);
  return vector;
}

async function save(entry) {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const vector = await embed(entry.content);

  const record = {
    id: entry.id || `kb-${Date.now()}`,
    values: vector,
    metadata: {
      content: String(entry.content),
      tipo: String(entry.tipo || 'general'),
      geografia: String(entry.geografia || 'global'),
      autor: String(entry.autor || 'equipo'),
      fecha: String(entry.fecha || new Date().toISOString()),
    }
  };

  console.log('  → KB: enviando a Pinecone, id:', record.id, 'vector length:', record.values.length);

  await index.upsert([record]);

  console.log('  → KB: guardado OK');
  return { ok: true, id: record.id };
}

async function search(query, options = {}) {
  const index = pinecone.index(process.env.PINECONE_INDEX);
  const vector = await embed(query);
  const results = await index.query({
    vector,
    topK: options.topK || 5,
    includeMetadata: true,
    filter: options.filter || undefined,
  });
  return results.matches
    .filter(m => m.score > 0.75)
    .map(m => ({
      content: m.metadata.content,
      tipo: m.metadata.tipo,
      geografia: m.metadata.geografia,
      score: m.score,
    }));
}

module.exports = { save, search };
