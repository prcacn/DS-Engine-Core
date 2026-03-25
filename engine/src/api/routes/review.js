// review.js
// F-02 - Panel de revision de cambios breaking del flujo inverso
// Ruta: engine/src/api/routes/review.js

const express = require('express');
const router  = express.Router();
const fs      = require('fs').promises;
const path    = require('path');

const PENDING_DIR = path.join(__dirname, '../../../Simple/contracts/_pending');

// GET /review/pending - listar todos los cambios pendientes de revision
router.get('/pending', async (req, res) => {
  try {
    await fs.mkdir(PENDING_DIR, { recursive: true });
    const files = await fs.readdir(PENDING_DIR);
    const reviews = [];

    for (const file of files.filter(f => f.endsWith('.review.json'))) {
      try {
        const raw = await fs.readFile(path.join(PENDING_DIR, file), 'utf-8');
        const data = JSON.parse(raw);
        reviews.push({ file, ...data });
      } catch (e) {
        console.warn(`[Review] No se pudo leer ${file}:`, e.message);
      }
    }

    res.json({ count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /review/approve - aprobar un cambio breaking
router.post('/approve', async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'file requerido' });

  try {
    const filePath = path.join(PENDING_DIR, file);
    const raw = await fs.readFile(filePath, 'utf-8');
    const review = JSON.parse(raw);

    // Marcar como aprobado y mover a contratos
    const contractsDir = path.join(__dirname, '../../../Simple/contracts');
    const slug = file.replace('.review.json', '');

    // Si habia contrato previo, marcarlo como deprecated
    const contractPath = path.join(contractsDir, `${slug}.json`);
    try {
      const existing = JSON.parse(await fs.readFile(contractPath, 'utf-8'));
      existing.status = 'DEPRECATED';
      existing.deprecatedAt = new Date().toISOString();
      existing.deprecatedReason = review.reason;
      await fs.writeFile(contractPath, JSON.stringify(existing, null, 2));
    } catch { /* no habia contrato previo */ }

    // Eliminar el pending
    await fs.unlink(filePath);

    console.log(`[Review] APROBADO: ${file}`);
    res.json({ status: 'approved', file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /review/reject - rechazar un cambio breaking (eliminar pending sin aplicar)
router.post('/reject', async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: 'file requerido' });

  try {
    const filePath = path.join(PENDING_DIR, file);
    await fs.unlink(filePath);
    console.log(`[Review] RECHAZADO: ${file}`);
    res.json({ status: 'rejected', file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
