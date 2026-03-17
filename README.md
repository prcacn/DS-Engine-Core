# DS IA-Ready Engine

> Motor que convierte descripciones en lenguaje natural en pantallas de producto gobernadas por el Design System.

**Producción** → `https://ds-ia-ready-engine-production.up.railway.app`  
**Repo** → `https://github.com/prcacn/DS-Engine-Core` (privado)  
**Versión actual** → Level 4.0 (KB activa, agentes en integración)

---

## Qué hace este sistema

El diseñador escribe un brief en lenguaje natural. El engine lo analiza, selecciona el patrón de pantalla correcto, compone los componentes del DS, aplica las reglas de la Knowledge Base y devuelve un plan listo para pintar en Figma — con un score de confianza que indica si necesita revisión.

```
"listado de fondos con filtro por categoría"
        ↓
  enrichBriefWithKnowledge()   ← Pinecone añade contexto organizacional
        ↓
  parseIntent()                ← Claude detecta tipo, dominio y violaciones
        ↓
  buildCompositionPlan()       ← Selecciona patrón + arma componentes
        ↓
  runAgents()                  ← UX Writer + UX Spec en paralelo
        ↓
  applyKBRules()               ← Red de seguridad: restricciones y normativas
        ↓
  calculateScore()             ← Confianza global 0–100%
        ↓
  JSON → Figma
```

---

## Estado actual del sistema

| Módulo | Estado | Notas |
|---|---|---|
| `/generate` | ✅ Producción | Endpoint principal |
| `/validate` | ✅ Producción | Validación de componentes |
| `/paint` | ✅ Producción | Cola para Figma |
| `/registry` | ✅ Producción | Búsqueda semántica |
| `/knowledge` | ✅ Producción | Ingesta y listado de reglas KB |
| Confidence Score | ✅ Producción | 4 señales: CONTRACT, INTENT, PRECEDENT, RULES |
| Intent Parser | ✅ Producción | Claude API + fallback por keywords |
| KB Governance | ✅ Producción | applyKBRules() con reemplazos automáticos |
| Pinecone (KB) | ✅ Producción | ~27 reglas indexadas, dimension 1024 |
| Agente Arquitecto | ✅ Producción | buildCompositionPlan() en generate.js |
| Agente UX Writer | ⚠️ Pendiente deploy | Archivo listo en /agents |
| Agente UX Spec | ⚠️ Pendiente deploy | Archivo listo en /agents |
| Orquestador | ⚠️ Pendiente deploy | Archivo listo en /agents |
| nodeIds de Figma | ⚠️ Pendiente mapear | Contratos usan placeholders |
| /examples aprobados | ⚠️ Vacío | Afecta score PRECEDENT |

---

## Arquitectura de carpetas

```
DS Engine Core/
├── engine/                        → Backend (Node.js + Express)
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── generate.js    → Flujo principal de generación
│   │   │   │   ├── validate.js    → Validación de composiciones
│   │   │   │   ├── paint.js       → Cola de pintado en Figma
│   │   │   │   ├── registry.js    → Búsqueda semántica de componentes
│   │   │   │   └── knowledge.js   → Gestión de reglas en Pinecone
│   │   │   └── middleware/
│   │   │       ├── auth.js        → API Key (X-API-Key header)
│   │   │       └── errorHandler.js
│   │   ├── core/
│   │   │   ├── intentParser.js    → Claude analiza el brief
│   │   │   └── confidenceScore.js → Score de 4 señales ponderadas
│   │   ├── agents/                → Agentes especializados (pendiente deploy)
│   │   │   ├── uxWriterAgent.js
│   │   │   ├── uxSpecAgent.js
│   │   │   └── orchestrator.js
│   │   ├── loaders/               → Lee contratos, patrones y registry del DS
│   │   └── server.js
│   └── public/
│       ├── index.html             → Web app del engine
│       └── kb-portal.html         → Portal de gestión de Knowledge Base
│
└── Simple/                        → Repositorio del Design System
    ├── contracts/                 → Especificación de cada componente (JSON)
    ├── patterns/                  → Reglas de composición por tipo de pantalla
    ├── registry/                  → Índice semántico para búsqueda
    ├── tokens/                    → Valores de diseño (primitivos y semánticos)
    └── examples/                  → Pantallas aprobadas como ground truth ⚠️ vacío
```

---

## Componentes del DS

| Componente | Máx por pantalla | Variantes principales |
|---|---|---|
| `navigation-header` | 1 | default, back, close, transparent |
| `button-primary` | 1 | default, destructive, loading |
| `button-secondary` | 1 | default, destructive |
| `card-item` | ∞ | default, compact, expanded, highlighted, disabled |
| `input-text` | ∞ | default, error, disabled, password |
| `filter-bar` | 1 | chips, tabs, dropdown |
| `empty-state` | 1 | default, cta, locked |
| `modal-bottom-sheet` | 1 | default, confirmation, form |
| `tab-bar` | 1 | default (solo usuario autenticado) |
| `list-header` | 3 | default, collapsible |
| `badge` | 3 | default, warning, success, error |
| `notification-banner` | 1 (5 en patrón notificaciones) | info, warning, error, success |

**Reglas de exclusividad clave:**
- `card-item` y `empty-state` no pueden coexistir como requeridos
- `filter-bar` solo en patrones de listado, nunca en formularios
- `tab-bar` nunca en onboarding

---

## Patrones de pantalla disponibles

| Pattern | Componentes requeridos | Cuándo usarlo |
|---|---|---|
| `lista-con-filtros` | navigation-header, filter-bar, card-item | Listados navegables |
| `formulario-simple` | navigation-header, input-text, button-primary | Login, registro, edición |
| `confirmacion` | modal-bottom-sheet, button-primary, button-secondary | Acciones irreversibles |
| `detalle` | navigation-header, card-item | Vista de detalle de un item |
| `onboarding` | navigation-header, button-primary | Bienvenida a nuevos usuarios |
| `perfil-usuario` | navigation-header, list-header, card-item | Datos y configuración |
| `error-estado` | navigation-header, empty-state | Errores, sin conexión, sin resultados |
| `notificaciones` | navigation-header, notification-banner, list-header | Alertas y avisos |

---

## Confidence Score

Cada pantalla generada recibe un score de confianza calculado a partir de 4 señales:

| Señal | Peso | Qué mide |
|---|---|---|
| CONTRACT | 30% | Componentes con node_id real + whenToUse en contrato |
| INTENT | 25% | Claridad del brief — score interno de Claude |
| PRECEDENT | 25% | Ejemplos aprobados en `/examples` para ese patrón |
| RULES | 20% | Ausencia de violaciones de composición |

| Score | Estado | Qué significa |
|---|---|---|
| ≥ 80% | `AUTO_APPROVE` | Listo para pintar en Figma |
| 60–79% | `REVIEW_FLAGGED` | Revisar antes de pintar |
| < 60% | `NEEDS_REVIEW` | Brief o contratos incompletos |

**Para subir el score rápido:** añadir pantallas aprobadas a `/examples` y escribir briefs más descriptivos (dominio + acción + estado vacío + CTA).

---

## Knowledge Base (Pinecone)

Las reglas viven en Pinecone y se recuperan semánticamente para cada brief. Hay 4 tipos:

| Tipo | Prioridad | Qué hace |
|---|---|---|
| `restriccion` | Alta | Reemplaza componentes que exponen contenido restringido |
| `recomendacion` | Alta | Añade componentes sugeridos si no existen |
| `normativa` | Media | Inyecta notification-banner para avisos regulatorios |
| `ds-pattern` | Baja | Registra el patrón usado como informativo |

**Ingestar una regla:**
```bash
curl -X POST https://ds-ia-ready-engine-production.up.railway.app/knowledge/ingest \
  -H "X-API-Key: dev-key-local-2025" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "En España mostrar siempre el campo IBAN en formularios de pago.",
    "type": "normativa",
    "categoria": "formularios",
    "prioridad": "media",
    "tags": ["españa", "iban", "pagos"],
    "autor": "pablo"
  }'
```

---

## Endpoints de la API

Todos los endpoints (excepto `/health`) requieren el header `X-API-Key: dev-key-local-2025`.

```
GET  /health                    → Estado del servidor
POST /generate                  → Generar plan de pantalla desde brief
POST /validate                  → Validar lista de componentes contra un patrón
POST /paint                     → Añadir plan a la cola de Figma
GET  /registry/components       → Listar todos los componentes
GET  /registry/search?q=...     → Búsqueda semántica de componentes
GET  /knowledge/list            → Listar reglas de la KB
POST /knowledge/ingest          → Añadir regla a Pinecone
```

**Ejemplo de llamada a /generate:**
```bash
curl -X POST https://ds-ia-ready-engine-production.up.railway.app/generate \
  -H "X-API-Key: dev-key-local-2025" \
  -H "Content-Type: application/json" \
  -d '{"brief": "pantalla de listado de fondos con filtro por categoría"}'
```

---

## Setup local

```bash
# 1. Clonar
git clone https://github.com/prcacn/DS-Engine-Core
cd DS-Engine-Core/engine

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env:
#   DS_REPO_PATH=/Users/pablo.reguera/DS Engine Core/Simple
#   ANTHROPIC_API_KEY=sk-...
#   PINECONE_API_KEY=...
#   PINECONE_HOST=https://ds-knowledge-base-7ghvo9p.svc.aped-4627-b74a.pinecone.io
#   PINECONE_DIMENSION=1024

# 4. Arrancar en desarrollo
npm run dev
# → http://localhost:3000
```

---

## Deploy a Railway

```bash
cd "DS Engine Core/engine"
railway up
```

**Variables de entorno en Railway** — siempre via CLI para evitar problemas de encoding:
```bash
railway service                          # seleccionar el servicio
railway variables set PINECONE_HOST=https://ds-knowledge-base-7ghvo9p.svc.aped-4627-b74a.pinecone.io
railway variables set PINECONE_DIMENSION=1024
railway up
```

---

## Clientes del engine

| Cliente | Dónde | Qué hace |
|---|---|---|
| Web app | `engine/public/index.html` | Generador con panel de análisis y score |
| KB Portal | `engine/public/kb-portal.html` | Gestión de reglas de la Knowledge Base |
| Plugin Figma | `figma-plugin/` | Genera y pinta directamente desde Figma |

---

## Próximos pasos (roadmap)

**Level 3.2 — Deploy de agentes** ← siguiente
- [ ] Copiar `uxWriterAgent.js`, `uxSpecAgent.js`, `orchestrator.js` a `/src/agents/`
- [ ] Actualizar `generate.js` para usar el orquestador
- [ ] Deploy a Railway

**Level 3.3 — Patrones avanzados**
- [ ] Mapear `nodeId` reales de Figma en los contratos
- [ ] Crear intent type `dashboard` con su propio patrón
- [ ] Formalizar lógica de `modal-bottom-sheet` en el patrón `confirmacion`

**Level 4.0 — KB completa**
- [ ] Construir `enrichBriefWithKnowledge()` e integrarlo en `/generate`
- [ ] Ingestar las 30 reglas de KB via `node ingest-kb-rules.js`
- [ ] Panel de gestión de KB en `kb-portal.html`

**Intent Enhancement (post 4.0)**
- [ ] Brief Quality Analyzer en tiempo real
- [ ] Sugerencias de reformulación cuando INTENT < 70%
- [ ] Brief Templates por tipo de pantalla
- [ ] Feedback loop → ingesta automática de decisiones en Pinecone

---

## Documentación adicional

| Documento | Qué cubre |
|---|---|
| `DS-Engine-Arquitectura.docx` | Arquitectura técnica completa, contratos, agentes y advertencias |
| `DS-Engine-BaseConocimiento.docx` | Visión y estrategia de la Knowledge Base |
| `Intent-Enhancement-Plan.docx` | Plan para mejorar el score de INTENT con sugerencias al diseñador |
