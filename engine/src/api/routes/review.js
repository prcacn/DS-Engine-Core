// review.js
// F-02/F-03 - Panel de revision + propagacion a GitHub
// Ruta: engine/src/api/routes/review.js

const express = require('express');
const router  = express.Router();
const { listPendingsFromGH, deletePendingFromGH, propagateApproval } = require('../../core/propagationEngine');
const { generateImpactReport } = require('../../core/impactReport');

// GET /review/pending - listar cambios pendientes desde GitHub
router.get('/pending', async (req, res) => {
  try {
    const reviews = await listPendingsFromGH();
    res.json({ count: reviews.length, reviews });
  } catch (err) {
    console.error('[Review] Error listando pendings:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /review/approve - aprobar un cambio breaking
router.post('/approve', async (req, res) => {
  const { file, sha } = req.body;
  if (!file) return res.status(400).json({ error: 'file requerido' });

  try {
    // 1. Recuperar el review completo para propagarlo
    const reviews = await listPendingsFromGH();
    const review  = reviews.find(r => r.file === file);

    if (!review) return res.status(404).json({ error: 'Review no encontrado' });

    // 2. Propagar el cambio aprobado al contrato en GitHub
    const propagation = await propagateApproval(review);

    // 3. Eliminar el pending de GitHub
    await deletePendingFromGH(file, review.sha);

    console.log(`[Review] APROBADO y propagado: ${file}`);
    res.json({ status: 'approved', file, propagation });

  } catch (err) {
    console.error('[Review] Error aprobando:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /review/reject - rechazar un cambio breaking
router.post('/reject', async (req, res) => {
  const { file, sha } = req.body;
  if (!file) return res.status(400).json({ error: 'file requerido' });

  try {
    const reviews = await listPendingsFromGH();
    const review  = reviews.find(r => r.file === file);
    if (!review) return res.status(404).json({ error: 'Review no encontrado' });

    await deletePendingFromGH(file, review.sha);
    console.log(`[Review] RECHAZADO: ${file}`);
    res.json({ status: 'rejected', file });

  } catch (err) {
    console.error('[Review] Error rechazando:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /review/impact/:file - generar impact report antes de aprobar
router.get('/impact/:file', async (req, res) => {
  const { file } = req.params;
  try {
    const reviews = await listPendingsFromGH();
    const review  = reviews.find(r => r.file === file);
    if (!review) return res.status(404).json({ error: 'Review no encontrado' });
    const report = await generateImpactReport(review);
    res.json(report);
  } catch (err) {
    console.error('[Review] Error generando impact report:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
