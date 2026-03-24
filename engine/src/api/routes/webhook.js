// webhook.js
// Ruta Express para recibir webhooks de Figma
// Ruta: engine/src/api/routes/webhook.js

const express = require('express');
const router = express.Router();
const { handleFigmaWebhook } = require('../../core/figmaWatcher');

// POST /webhook/figma
// Figma llama a este endpoint cuando hay cambios en el file registrado
router.post('/figma', handleFigmaWebhook);

// GET /webhook/status
// Verificar que el endpoint está activo
router.get('/status', (req, res) => {
  res.json({
    status: 'active',
    endpoint: '/webhook/figma',
    passcodeConfigured: !!process.env.FIGMA_WEBHOOK_PASSCODE,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
