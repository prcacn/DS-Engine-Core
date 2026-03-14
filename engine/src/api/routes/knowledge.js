// api/routes/knowledge.js — KB management endpoints
// POST /knowledge/ingest  → guardar una regla
// GET  /knowledge/list    → listar todas las reglas
// DELETE /knowledge/delete/:id → eliminar una regla

const express = require('express');
const router  = express.Router();

// ── Intentar cargar el cliente de Pinecone si está configurado ─────────────
let pineconeIndex = null;

async function getPineconeIndex() {
  if (pineconeIndex) return pineconeIndex;
  if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX) return null;
  try {
    const { Pinecone } = require('@pinecone-database/pinecone');
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    pineconeIndex = pc.index(process.env.PINECONE_INDEX);
    return pineconeIndex;
  } catch (e) {
    console.warn('  ⚠ Pinecone no disponible:', e.message);
    return null;
  }
}

// ── Fallback en memoria (caché — se sincroniza con Pinecone al arrancar) ──
let memoryStore = [];
let storeLoaded = false;

// Carga las entradas de Pinecone al arrancar el servidor
async function initStore() {
  if (storeLoaded) return;
  storeLoaded = true;
  try {
    const index = await getPineconeIndex();
    if (!index) return;
    const dim = parseInt(process.env.PINECONE_DIMENSION || '1024');
    const zeroVector = new Array(dim).fill(0);
    const result = await index.query({ vector: zeroVector, topK: 500, includeMetadata: true });
    memoryStore = (result.matches || []).map(m => ({ id: m.id, ...m.metadata }));
    console.log(`  ✓ [KB] ${memoryStore.length} reglas cargadas desde Pinecone`);
  } catch (e) {
    console.warn('  ⚠ [KB] No se pudo cargar desde Pinecone:', e.message);
  }
}

// Llamar al arrancar
initStore();

function makeId() {
  return 'kb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

// ── POST /knowledge/ingest ─────────────────────────────────────────────────
router.post('/ingest', async (req, res) => {
  try {
    const {
      text, content,          // acepta ambos por compatibilidad
      categoria  = 'recomendacion',
      prioridad  = 'media',
      tipo       = 'regla-de-negocio',
      tags       = [],
      autor,
      fecha,
      geografia,
      fuente,
      expira,
    } = req.body;

    const ruleText = text || content;
    if (!ruleText || !ruleText.trim()) {
      return res.status(400).json({ ok: false, error: 'El campo text es obligatorio' });
    }

    const id = makeId();
    const entry = {
      id,
      text:       ruleText.trim(),
      categoria,
      prioridad,
      tipo,
      tags:       Array.isArray(tags) ? tags : [],
      autor:      autor      || undefined,
      fecha:      fecha      || new Date().toISOString().split('T')[0],
      geografia:  geografia  || undefined,
      fuente:     fuente     || undefined,
      expira:     expira     || undefined,
      created_at: new Date().toISOString(),
    };

    // Limpiar campos undefined
    Object.keys(entry).forEach(k => { if (entry[k] === undefined) delete entry[k]; });

    const index = await getPineconeIndex();

    if (index) {
      // ── Con Pinecone: intentar embedding, si falla guardar igual con vector cero
      const embedding = await createEmbedding(ruleText);
      const dim = parseInt(process.env.PINECONE_DIMENSION || '1024');
      const vector = embedding || new Array(dim).fill(0);

      await index.upsert([{
        id,
        values: vector,
        metadata: { ...entry },
      }]);
      const mode = embedding ? 'embedding real' : 'vector cero (sin OpenAI)';
      console.log(`  ✓ [KB/ingest] ${id} → Pinecone [${mode}] (${categoria}/${prioridad})`);
    }

    // Guardar siempre en memoria también (para /list inmediato y fallback)
    memoryStore.push(entry);
    console.log(`  ✓ [KB/ingest] ${id} → memoria (${categoria}/${prioridad})`);

    res.json({ ok: true, id, entry });

  } catch (err) {
    console.error('  ✗ [KB/ingest]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /knowledge/list ────────────────────────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    await initStore(); // asegura que Pinecone está cargado
    console.log(`  ✓ [KB/list] ${memoryStore.length} entradas`);
    return res.json({ ok: true, total: memoryStore.length, entries: memoryStore });
  } catch (err) {
    console.error('  ✗ [KB/list]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── DELETE /knowledge/delete/:id ───────────────────────────────────────────
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ ok: false, error: 'ID requerido' });

  try {
    const index = await getPineconeIndex();

    if (index) {
      await index.deleteOne(id);
      console.log(`  ✓ [KB/delete] ${id} eliminado de Pinecone`);
    } else {
      const before = memoryStore.length;
      memoryStore = memoryStore.filter(e => e.id !== id);
      if (memoryStore.length === before) {
        return res.status(404).json({ ok: false, error: 'Entrada no encontrada' });
      }
      console.log(`  ✓ [KB/delete] ${id} eliminado de memoria`);
    }

    res.json({ ok: true, deleted: id });

  } catch (err) {
    console.error('  ✗ [KB/delete]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── Helper: generar embedding con OpenAI ──────────────────────────────────
async function createEmbedding(text) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });
    const data = await res.json();
    return data.data?.[0]?.embedding || null;
  } catch (e) {
    console.warn('  ⚠ Embedding fallido:', e.message);
    return null;
  }
}

module.exports = router;
