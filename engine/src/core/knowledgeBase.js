const { Pinecone } = require('@pinecone-database/pinecone');
const pinecone   = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const INDEX_NAME = process.env.PINECONE_INDEX || 'ds-knowledge-base';

async function embed(text) {
  const response = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: { 'Api-Key': process.env.PINECONE_API_KEY, 'Content-Type': 'application/json', 'X-Pinecone-API-Version': '2024-10' },
    body: JSON.stringify({ model: 'multilingual-e5-large', inputs: [{ text }], parameters: { input_type: 'passage', truncate: 'END' } }),
  });
  if (!response.ok) throw new Error('Pinecone embed error: ' + await response.text());
  const data = await response.json();
  const vector = data.data?.[0]?.values;
  if (!vector || vector.length === 0) throw new Error('Pinecone no devolvió vector válido');
  return vector;
}

async function save({ content, tipo = 'general', geografia = 'global', tags = [], autor = 'sistema', categoria = 'recomendacion', prioridad = 'media', expira = null }) {
  if (!content?.trim()) throw new Error('El contenido no puede estar vacío');
  if (expira && new Date(expira) < new Date()) throw new Error('La fecha de expiración ya pasó');
  const vector = await embed(content);
  const id = 'kb-' + Date.now();
  await pinecone.index(INDEX_NAME).upsert([{
    id,
    values: vector,
    metadata: { content, tipo, geografia, tags: Array.isArray(tags) ? tags.join(',') : tags, autor, categoria, prioridad, expira: expira || '', fecha: new Date().toISOString() },
  }]);
  return { id, content, tipo, geografia, categoria, prioridad, expira };
}

async function search(query, { geografia = null, tipo = null, categoria = null, prioridad = null, topK = 3, minScore = 0.70 } = {}) {
  const vector = await embed(query);
  const filter = {};
  if (geografia) filter.geografia = { $in: [geografia, 'global'] };
  if (tipo)      filter.tipo      = tipo;
  if (categoria) filter.categoria = categoria;
  if (prioridad) filter.prioridad = prioridad;
  const results = await pinecone.index(INDEX_NAME).query({ vector, topK, includeMetadata: true, filter: Object.keys(filter).length > 0 ? filter : undefined });
  const now = new Date();
  return (results.matches || [])
    .filter(m => m.score >= minScore)
    .filter(m => !m.metadata?.expira || new Date(m.metadata.expira) > now)
    .map(m => ({
      id: m.id, score: m.score, content: m.metadata?.content,
      tipo: m.metadata?.tipo, geografia: m.metadata?.geografia,
      autor: m.metadata?.autor, categoria: m.metadata?.categoria || 'recomendacion',
      prioridad: m.metadata?.prioridad || 'media',
      expira: m.metadata?.expira || null, fecha: m.metadata?.fecha || null,
    }));
}

module.exports = { save, search };
