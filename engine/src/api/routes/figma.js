// api/routes/figma.js — Cola de pintado
const express = require('express');
const router  = express.Router();

let queue = [];

// POST /figma/queue — webapp encola un plan
router.post('/queue', (req, res) => {
  const { plan } = req.body;
  if (!plan || !plan.components) return res.status(400).json({ ok: false, error: 'Missing plan' });
  const now = Date.now();
  queue = queue.filter(e => now - e.ts < 5 * 60 * 1000);
  const entry = { id: 'q_' + now, plan, ts: now, status: 'pending' };
  queue.push(entry);
  console.log(`  → [figma/queue] ${entry.id} — ${plan.pattern} (${plan.components.length} componentes)`);
  res.json({ ok: true, queueId: entry.id });
});

// GET /figma/queue — Claude lee la cola
router.get('/queue', (req, res) => {
  const now = Date.now();
  queue = queue.filter(e => now - e.ts < 5 * 60 * 1000);
  const pending = queue.filter(e => e.status === 'pending');
  res.json({ ok: true, pending: pending.length, items: pending });
});

// POST /figma/queue/:id/done
router.post('/queue/:id/done', (req, res) => {
  const entry = queue.find(e => e.id === req.params.id);
  if (entry) entry.status = 'done';
  res.json({ ok: true });
});

module.exports = router;
