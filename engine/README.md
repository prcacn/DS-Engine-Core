# DS IA-Ready Engine — v2.0 · Level 5.0

> Motor que convierte descripciones en lenguaje natural en pantallas de producto gobernadas por el Design System.
> La IA propone. El diseñador valida. El sistema aprende.

## Arquitectura

```
engine/
├── global-rules/          → Reglas que aplican a TODAS las pantallas
│   ├── navigation.md      → Jerarquía L0/L1/L2/L3 — fuente de verdad ejecutable
│   └── singleton-rules.md → Singletons, incompatibilidades, orden de composición
│
├── composition-patterns/  → Bloques reutilizables entre patrones
│   └── form-block.md      → Agrupación de campos con spacing DS
│
├── patterns/              → Tipos de pantalla (14 patrones)
│   ├── dashboard.md       · login.md       · registro.md
│   ├── detalle.md         · confirmacion.md · lista-con-filtros.md
│   ├── edicion-perfil.md  · formulario-producto.md · formulario-default.md
│   ├── onboarding.md      · perfil-usuario.md · error-estado.md
│   ├── notificaciones.md  · transferencia-bancaria.md (4 pasos)
│
├── contracts/             → Especificación de cada componente (18 componentes)
├── examples/              → Pantallas aprobadas como ground truth (5 bases)
├── templates/             → Templates de generación rápida
│
└── src/
    ├── core/
    │   ├── navigationMaps.js      → INTENT_TO_LEVEL · INTENT_TO_PATTERN (fuente única)
    │   ├── globalRulesParser.js   → Lee global-rules/*.md como código ejecutable
    │   ├── briefEnricher.js       → Level 4.0 — KB antes de parseIntent
    │   ├── intentParser.js        → Clasifica briefs con Claude API
    │   ├── compositionBuilder.js  → buildCompositionPlan + helpers
    │   ├── kbGovernance.js        → applyKBRules + applyFinancialVariant
    │   ├── confidenceScore.js     → Score 4 señales (CONTRACT/INTENT/PRECEDENT/RULES)
    │   ├── variantParser.js       → Level 5.1 — detecta variantes de bases aprobadas
    │   ├── deltaEngine.js         → Level 5.2 — aplica delta sobre base aprobada
    │   ├── knowledgeBase.js       → Interfaz con Pinecone (save/search/remove)
    │   └── briefEnricher.js       → Enriquece brief con contexto KB
    │
    ├── agents/
    │   ├── orchestrator.js        → Corre UXWriter + UXSpec en paralelo
    │   ├── uxWriterAgent.js       → Genera copy real por componente
    │   └── uxSpecAgent.js         → Ajusta variantes y estados
    │
    ├── api/routes/
    │   ├── generate.js            → POST /generate (pantalla única + multiscreen)
    │   ├── approve.js             → POST /approve (Level 5.4 — ApprovalLoop)
    │   ├── validate.js            → POST /validate (Studio — score de pantalla)
    │   ├── knowledge.js           → GET/POST /knowledge (gestión KB)
    │   └── generate-doc.js        → POST /generate-doc
    │
    └── loaders/
        ├── contractLoader.js      → Carga contratos desde /contracts/*.md
        ├── patternLoader.js       → Carga patrones desde /patterns/*.md
        └── templateLoader.js      → Carga templates desde /templates/*.md
```

## Flujo de generación

```
Brief → enrichBriefWithKnowledge() → parseIntent() → variantParser.detect()
  ↓ (si variante)                    ↓ (si nueva)
  deltaEngine.apply()                buildCompositionPlan()
  → propuesta con diff               → runAgents() [UXWriter + UXSpec paralelo]
                                     → applyKBRules()
                                     → calculateScore()
                                     → JSON response
```

## Knowledge Base (Pinecone)

23 reglas fintech genéricas organizadas en 5 bloques:
- **Normativa regulatoria** — CNMV, KYC, PSD2, MiFID II, formatos geográficos
- **Errores históricos** — Q1/Q2/Q3 2023, lecciones aprendidas del equipo
- **Diferencias geográficas** — España, México, Colombia
- **Patrones de producto financiero** — transferencias, fondos, onboarding
- **Voz y tono** — copy de botones, empty states, errores

## Deploy

```bash
cd engine && railway up
```

Variables requeridas: `ANTHROPIC_API_KEY`, `PINECONE_API_KEY`, `PINECONE_HOST`
