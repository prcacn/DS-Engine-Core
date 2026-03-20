// core/pineconeEmbed.js
// ─────────────────────────────────────────────────────────────────────────────
// FUENTE ÚNICA DE VERDAD para embeddings de Pinecone.
//
// ⚠ IMPORTANTE: Este módulo es el ÚNICO lugar donde se define el modelo de
// embedding. Tanto el ingest (knowledge.js) como la búsqueda (knowledgeBase.js)
// deben importar embed() desde aquí — NUNCA definir su propia función embed.
//
// Modelo: Pinecone Inference multilingual-e5-large
// Dimensiones: 1024 (configurado en PINECONE_DIMENSION)
// Sin dependencia de OpenAI API key
// ─────────────────────────────────────────────────────────────────────────────

async function embed(text, inputType = 'passage') {
  const response = await fetch('https://api.pinecone.io/embed', {
    method: 'POST',
    headers: {
      'Api-Key': process.env.PINECONE_API_KEY,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10',
    },
    body: JSON.stringify({
      model: 'multilingual-e5-large',
      inputs: [{ text }],
      parameters: { input_type: inputType, truncate: 'END' },
    }),
  });

  if (!response.ok) {
    throw new Error('Pinecone embed error: ' + await response.text());
  }

  const data   = await response.json();
  const vector = data.data?.[0]?.values;
  if (!vector || vector.length === 0) {
    throw new Error('Pinecone no devolvió vector válido');
  }
  return vector;
}

module.exports = { embed };
