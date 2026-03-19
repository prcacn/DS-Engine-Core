// api/routes/generate-doc.js
// POST /generate-doc
// Recibe brief + componentes + score + kb_rules
// Devuelve documentación .md generada por Claude con contexto real del DS

const express         = require('express');
const router          = express.Router();
const Anthropic       = require('@anthropic-ai/sdk');
const { loadContracts } = require('../../loaders/contractLoader');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.post('/', async function(req, res, next) {
  try {
    const { brief, components, score, kb_rules } = req.body;

    if (!brief || !components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'BadRequest', message: 'brief y components son requeridos' });
    }

    const contracts = loadContracts();

    // Construir contexto de contratos para cada componente detectado
    const contractContext = components.map(c => {
      const contract = contracts[c.component];
      if (!contract) return `- ${c.component}: sin contrato definido`;
      return [
        `- **${c.component}**`,
        contract.description ? `  Descripción: ${contract.description}` : '',
        contract.whenToUse?.length ? `  Cuándo usarlo: ${contract.whenToUse.slice(0,2).join('; ')}` : '',
        contract.restrictions?.length ? `  Restricciones: ${contract.restrictions.slice(0,2).join('; ')}` : '',
      ].filter(Boolean).join('\n');
    }).join('\n');

    // Construir contexto KB
    const kbContext = (kb_rules || []).length > 0
      ? (kb_rules || []).map(r => `- [${r.categoria || r.tipo || 'regla'}] ${r.content || r.text || ''}`).join('\n')
      : 'No se aplicaron reglas de KB específicas.';

    const componentNames = components.map(c => c.component).join(', ');

    const prompt = `Eres un experto en Design Systems. Genera documentación técnica en formato Markdown para la siguiente pantalla.

## Brief
${brief}

## Composición (${components.length} componentes, score ${score}%)
${componentNames}

## Contratos DS aplicados
${contractContext}

## Reglas KB aplicadas
${kbContext}

Genera un documento Markdown con estas secciones (sin añadir nada más):

# [Nombre descriptivo de la pantalla]

## Propósito
Una frase clara sobre qué hace esta pantalla y para quién.

## Composición
Lista de componentes con su rol en la pantalla. Para cada uno: nombre, variante usada si aplica, y por qué está aquí.

## Flujo del usuario
Pasos concretos que sigue el usuario en esta pantalla. Máximo 5 pasos.

## Reglas aplicadas
Las reglas de la KB que condicionaron esta composición. Solo las relevantes.

## Decisiones de diseño
2-3 decisiones clave tomadas y por qué (basadas en los contratos y reglas).

## Notas para el equipo
Advertencias, casos edge o contexto que otro diseñador debe saber antes de tocar esta pantalla.

Sé concreto y directo. Nada genérico. Todo basado en los datos reales proporcionados.`;

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const doc = response.content[0]?.text || '// Error generando documentación';

    console.log(`  ✓ [generate-doc] brief="${brief.slice(0,40)}..." · ${components.length} componentes · ${doc.length} chars`);

    res.json({ ok: true, doc, brief, score, components: components.length });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
