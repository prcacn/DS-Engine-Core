# DS IA-Ready — Engine Core v1.0

API REST que genera planes de composición de pantallas a partir de un brief en lenguaje natural. Lee los contratos, patterns y registry del Simple DS y devuelve un JSON estructurado con los componentes necesarios.

## Requisitos

- Node.js 18+
- El repo `simple` con los contratos del DS

## Instalación

```bash
cd engine
npm install
cp .env.example .env
# Edita .env y ajusta DS_REPO_PATH a tu ruta local
```

## Arrancar el servidor

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`

## Endpoints

### Health check
```
GET /health
```
Sin autenticación. Verifica que el servidor está vivo.

### Generar pantalla
```
POST /generate
Header: X-API-Key: dev-key-local-2025
Body: { "brief": "pantalla de listado de fondos con filtros" }
```

### Validar componentes
```
POST /validate
Header: X-API-Key: dev-key-local-2025
Body: { "components": [...], "pattern": "lista-con-filtros" }
```

### Buscar en registry
```
GET /registry/search?q=item de lista con precio
Header: X-API-Key: dev-key-local-2025
```

### Listar componentes
```
GET /registry/components
Header: X-API-Key: dev-key-local-2025
```

## Estructura

```
engine/
├── src/
│   ├── api/
│   │   ├── routes/        → generate.js, validate.js, registry.js
│   │   └── middleware/    → auth.js, errorHandler.js
│   ├── loaders/           → contractLoader.js, patternLoader.js, registryLoader.js
│   └── server.js
├── .env.example
└── package.json
```

## Estado actual

- **Fase 1** ✅ — Servidor funcional con detección de pattern por keywords
- **Fase 2** 🔜 — Intent Parser con Claude API (LLM)
- **Fase 3** 🔜 — Confidence Score calibrado + Feedback loop
