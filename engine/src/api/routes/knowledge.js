// api/routes/knowledge.js
const express = require('express');
const router  = express.Router();

let memoryStore = [];
let initialLoad = false;

function makeId() {
  return 'kb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function cfg() {
  const apiKey = process.env.PINECONE_API_KEY;
  const host   = (process.env.PINECONE_HOST || '').replace(/\/$/, '');
  if (!apiKey || !host) return null;
  return { apiKey, host };
}

// ── Pinecone: listar todos los IDs y luego fetch metadata ─────────────────
async function pcListAll() {
  const c = cfg(); if (!c) return null;
  try {
    // Paso 1: obtener todos los IDs via /vectors/list (paginado)
    let allIds = [];
    let paginationToken = null;

    do {
      const url = paginationToken
        ? `${c.host}/vectors/list?limit=100&paginationToken=${encodeURIComponent(paginationToken)}`
        : `${c.host}/vectors/list?limit=100`;

      const r = await fetch(url, { headers: { 'Api-Key': c.apiKey } });
      if (!r.ok) {
        const txt = await r.text();
        console.warn('  ⚠ [KB] list error:', r.status, txt);
        return null;
      }
      const data = await r.json();
      const ids = (data.vectors || []).map(v => v.id);
      allIds = allIds.concat(ids);
      paginationToken = data.pagination?.next || null;
    } while (paginationToken);

    console.log(`  ✓ [KB] ${allIds.length} IDs encontrados en Pinecone`);
    if (allIds.length === 0) return [];

    // Paso 2: fetch metadata en lotes de 100
    let entries = [];
    for (let i = 0; i < allIds.length; i += 100) {
      const batch = allIds.slice(i, i + 100);
      const params = batch.map(id => `ids=${encodeURIComponent(id)}`).join('&');
      const r = await fetch(`${c.host}/vectors/fetch?${params}`, {
        headers: { 'Api-Key': c.apiKey },
      });
      if (!r.ok) continue;
      const data = await r.json();
      const batchEntries = Object.values(data.vectors || {}).map(v => ({
        id: v.id,
        ...(v.metadata || {}),
      }));
      entries = entries.concat(batchEntries);
    }

    console.log(`  ✓ [KB] ${entries.length} entradas recuperadas con metadata`);
    return entries;

  } catch(e) {
    console.warn('  ⚠ [KB] pcListAll error:', e.message);
    return null;
  }
}

// ── Pinecone: upsert ───────────────────────────────────────────────────────
async function pcUpsert(id, vector, metadata) {
  const c = cfg(); if (!c) return false;
  try {
    const r = await fetch(`${c.host}/vectors/upsert`, {
      method: 'POST',
      headers: { 'Api-Key': c.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ vectors: [{ id, values: vector, metadata }] }),
    });
    if (!r.ok) { const txt = await r.text(); console.warn('  ⚠ upsert:', r.status, txt); }
    return r.ok;
  } catch(e) { console.warn('  ⚠ upsert:', e.message); return false; }
}

// ── Pinecone: delete ───────────────────────────────────────────────────────
async function pcDelete(id) {
  const c = cfg(); if (!c) return false;
  try {
    const r = await fetch(`${c.host}/vectors/delete`, {
      method: 'POST',
      headers: { 'Api-Key': c.apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [id] }),
    });
    return r.ok;
  } catch(e) { console.warn('  ⚠ delete:', e.message); return false; }
}

// ── Embedding OpenAI (opcional) ────────────────────────────────────────────
// ─── EMBEDDINGS - importado desde pineconeEmbed.js (fuente única) ────────────
// ⚠ NO redefinir embed aquí. Usar siempre pineconeEmbed.js
const { embed: _embed } = require('../../core/pineconeEmbed');
async function embed(text) {
  try { return await _embed(text, 'passage'); }
  catch(e) { console.error('  ✗ [KB/embed]', e.message); return null; }
}

// ── Carga inicial desde Pinecone ───────────────────────────────────────────
async function loadFromPinecone() {
  if (initialLoad) return;
  initialLoad = true;
  if (!cfg()) {
    console.log('  ℹ [KB] Pinecone no configurado - modo memoria');
    return;
  }
  const entries = await pcListAll();
  if (entries && entries.length > 0) {
    memoryStore = entries;
    console.log(`  ✓ [KB] store cargado: ${memoryStore.length} reglas`);
  } else {
    console.log('  ℹ [KB] Pinecone vacío o error - store en memoria');
  }
}
loadFromPinecone();

// ── POST /knowledge/ingest ─────────────────────────────────────────────────
router.post('/ingest', async (req, res) => {
  try {
    const {
      text, content,
      categoria = 'recomendacion', prioridad = 'media',
      tipo = 'regla-de-negocio', tags = [],
      autor, fecha, geografia, fuente, expira,
    } = req.body;

    const ruleText = (text || content || '').trim();
    if (!ruleText) return res.status(400).json({ ok: false, error: 'El campo text es obligatorio' });

    const id = makeId();
    const entry = {
      id, text: ruleText, categoria, prioridad, tipo,
      tags: Array.isArray(tags) ? tags : [],
      fecha: fecha || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    if (autor)     entry.autor     = autor;
    if (geografia) entry.geografia = geografia;
    if (fuente)    entry.fuente    = fuente;
    if (expira)    entry.expira    = expira;

    // 1. Guardar en memoria inmediatamente
    memoryStore.push(entry);

    // 2. Persistir en Pinecone
    if (cfg()) {
      const vector = await embed(ruleText);
      if (!vector) {
        console.warn('  ⚠ [KB/ingest] embed() falló — entrada guardada solo en memoria, NO en Pinecone:', id);
      } else {
        const saved = await pcUpsert(id, vector, entry);
        console.log(`  ✓ [KB/ingest] ${id} → Pinecone: ${saved ? '✓' : '✗'}`);
      }
    } else {
      console.log(`  ✓ [KB/ingest] ${id} → memoria`);
    }

    res.json({ ok: true, id, entry });
  } catch(err) {
    console.error('  ✗ [KB/ingest]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /knowledge/list ────────────────────────────────────────────────────
router.get('/list', async (req, res) => {
  try {
    // Forzar recarga desde Pinecone si el store está vacío
    if (memoryStore.length === 0 && cfg()) {
      initialLoad = false;
      await loadFromPinecone();
    }
    console.log(`  ✓ [KB/list] ${memoryStore.length} entradas`);
    res.json({ ok: true, total: memoryStore.length, entries: memoryStore });
  } catch(err) {
    console.error('  ✗ [KB/list]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── DELETE /knowledge/delete/:id ───────────────────────────────────────────
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    memoryStore = memoryStore.filter(e => e.id !== id);
    if (cfg()) await pcDelete(id);
    console.log(`  ✓ [KB/delete] ${id}`);
    res.json({ ok: true, deleted: id });
  } catch(err) {
    console.error('  ✗ [KB/delete]', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;


// ── POST /knowledge/feedback ──────────────────────────────────────────────
// Recibe la validación del diseñador y la ingesta en Pinecone como conocimiento
// status: 'approved' | 'rejected' | 'modified'
router.post('/feedback', async (req, res) => {
  try {
    const { screen_id, brief, status, pattern, components, motivo, modificaciones } = req.body;
    if (!brief || !status) return res.status(400).json({ ok: false, error: 'brief y status son obligatorios' });

    const entries = [];

    // B2: las pantallas aprobadas NO se guardan en Pinecone KB como screen-docs.
    // Los ejemplos aprobados van a /examples (templateLoader) - no a la KB semántica.
    // Solo se guardan en KB las decisiones de rechazo con motivo claro (reglas de negocio)
    // y las modificaciones con un aprendizaje explícito. Sin listas de componentes
    // que generen falsos positivos semánticos.
    if (status === 'approved') {
      // No guardamos en KB - el ejemplo aprobado va a /examples via templateLoader
      console.log('  [KB/feedback] approved - no se guarda en Pinecone (evitar screen-doc noise)');
    } else if (status === 'rejected' && motivo) {
      // Solo guardamos el motivo de rechazo como regla, sin mencionar componentes
      entries.push({
        text: 'DECISION DE DISEÑO - RECHAZO: Para briefs similares a "' + brief.substring(0, 60) + '": ' + motivo,
        categoria: 'restriccion',
        prioridad: 'alta',
        tipo: 'decision',
        autor: 'feedback-loop',
        geografia: 'global',
      });
    } else if (status === 'modified' && modificaciones) {
      // Solo guardamos el aprendizaje, sin mencionar componentes específicos
      entries.push({
        text: 'APRENDIZAJE DE DISEÑO: Para briefs similares a "' + brief.substring(0, 60) + '": ' + modificaciones,
        categoria: 'recomendacion',
        prioridad: 'media',
        tipo: 'decision',
        autor: 'feedback-loop',
        geografia: 'global',
      });
    }

    const saved = [];
    for (const entry of entries) {
      const id = makeId();
      const fullEntry = {
        id, ...entry,
        fecha: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };
      memoryStore.push(fullEntry);
      if (cfg()) {
        const vector = await embed(entry.text);
        if (!vector) {
          console.warn('  ⚠ [KB/feedback] embed() falló — guardado solo en memoria:', id);
        } else {
          await pcUpsert(id, vector, fullEntry);
        }
      }
      saved.push(id);
      console.log('  [KB/feedback] ' + status + ' guardado: ' + id);
    }

    res.json({
      ok: true,
      status,
      saved,
      message: saved.length > 0 ? 'Feedback registrado en KB' : 'Sin entradas que guardar'
    });
  } catch(err) {
    console.error('  [KB/feedback] error:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /knowledge/debug - ver respuesta raw de Pinecone ──────────────────
router.get('/debug', async (req, res) => {
  const c = cfg();
  if (!c) return res.json({ ok: false, error: 'Pinecone no configurado', env: { PINECONE_HOST: !!process.env.PINECONE_HOST, PINECONE_API_KEY: !!process.env.PINECONE_API_KEY } });
  try {
    // Probar /vectors/list
    const r1 = await fetch(`${c.host}/vectors/list?limit=10`, { headers: { 'Api-Key': c.apiKey } });
    const listRaw = await r1.text();

    // Probar /describe_index_stats
    const r2 = await fetch(`${c.host}/describe_index_stats`, { method: 'POST', headers: { 'Api-Key': c.apiKey, 'Content-Type': 'application/json' }, body: '{}' });
    const statsRaw = await r2.text();

    res.json({
      host: c.host,
      list_status: r1.status,
      list_response: JSON.parse(listRaw),
      stats_status: r2.status,
      stats_response: JSON.parse(statsRaw),
      memoryStore_count: memoryStore.length,
    });
  } catch(e) {
    res.json({ ok: false, error: e.message });
  }
});
