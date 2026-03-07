// core/intentParser.js
// Fase 2 — Usa Claude API para interpretar el brief en lenguaje natural
// y devolver un IntentObject estructurado

const Anthropic = require('@anthropic-ai/sdk');

let client = null;

function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY no configurada en .env');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `Eres el Intent Parser de un Design System IA-Ready.
Tu única tarea es analizar un brief de diseño y devolver un JSON estructurado.

Los tipos de pantalla disponibles son:
- lista-con-filtros: listados navegables con filtros por categoría
- formulario-simple: captura de datos del usuario (login, registro, edición)
- confirmacion: confirmación de acciones importantes o irreversibles
- detalle: vista de detalle de un item específico

Los componentes disponibles son:
navigation-header, button-primary, button-secondary, card-item, input-text, filter-bar, empty-state, modal-bottom-sheet

Responde ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.
El JSON debe tener exactamente esta estructura:
{
  "intent_type": "lista-con-filtros | formulario-simple | confirmacion | detalle",
  "domain": "string corto describiendo el dominio (ej: fondos, login, transacciones)",
  "required_capabilities": ["array de capacidades necesarias"],
  "constraints": {
    "has_filters": boolean,
    "has_form_fields": boolean,
    "is_destructive": boolean,
    "needs_confirmation": boolean,
    "estimated_items": number o null
  },
  "confidence": número entre 0 y 1,
  "reasoning": "una frase corta explicando la decisión"
}`;

async function parseIntent(brief) {
  // Si no hay API Key configurada, fallback a keyword matching
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('  ⚠ ANTHROPIC_API_KEY no configurada — usando fallback keyword');
    return fallbackParse(brief);
  }

  try {
    const anthropic = getClient();

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Brief: "${brief}"` }
      ]
    });

    const raw = message.content[0].text.trim();

    // Limpiar posibles backticks si Claude los añade
    const clean = raw.replace(/```json|```/g, '').trim();
    const intent = JSON.parse(clean);

    console.log(`  ✓ Intent parseado: ${intent.intent_type} (${intent.domain}) confidence: ${intent.confidence}`);
    return intent;

  } catch (err) {
    console.error('  ✗ Error en Intent Parser:', err.message, err.status, err.error);
    console.log('  → Usando fallback keyword matching');
    return fallbackParse(brief);
  }
}

// Fallback keyword-based para cuando Claude no está disponible
function fallbackParse(brief) {
  const b = brief.toLowerCase();

  let intent_type = 'lista-con-filtros';
  let confidence  = 0.50;

  if (b.includes('formulario') || b.includes('login') || b.includes('registr') ||
      b.includes('contraseña') || b.includes('email') || b.includes('campo') ||
      b.includes('editar') || b.includes('guardar datos')) {
    intent_type = 'formulario-simple';
    confidence  = 0.70;
  } else if (b.includes('confirmar') || b.includes('confirmación') || b.includes('eliminar') ||
             b.includes('borrar') || b.includes('enviar dinero') || b.includes('irreversible')) {
    intent_type = 'confirmacion';
    confidence  = 0.70;
  } else if (b.includes('detalle') || b.includes('ficha') || b.includes('información de') ||
             b.includes('ver más') || b.includes('perfil de')) {
    intent_type = 'detalle';
    confidence  = 0.70;
  } else if (b.includes('lista') || b.includes('listado') || b.includes('filtro') ||
             b.includes('fondos') || b.includes('transacciones') || b.includes('resultados')) {
    intent_type = 'lista-con-filtros';
    confidence  = 0.75;
  }

  return {
    intent_type,
    domain:   'general',
    required_capabilities: [],
    constraints: {
      has_filters:       intent_type === 'lista-con-filtros',
      has_form_fields:   intent_type === 'formulario-simple',
      is_destructive:    intent_type === 'confirmacion',
      needs_confirmation: intent_type === 'confirmacion',
      estimated_items:   null
    },
    confidence,
    reasoning: 'Fallback keyword matching — sin Claude API'
  };
}

module.exports = { parseIntent };
