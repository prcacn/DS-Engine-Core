# Lista genérica con filtros
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.85
**domain:** general
**fecha:** 2026-03-24
**nav_level:** L1
**match_keywords:** lista, listado, elementos, items, resultados

## Descripción
Listado genérico navegable con filtros por categoría. Plantilla base para cualquier
pantalla de listado L1. La IA puede sobrescribir la cantidad de cards y los chips de filtro.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Listado")
  - ai_overridable: title

### content
- filter-bar (variant: chips, filters: ["Todos","Categoría A","Categoría B"])
  - ai_overridable: filters
- card-item ×5
  - ai_overridable: quantity (min: 1, max: 20)
  - default_props: { title: "Título del item", subtitle: "Subtítulo descriptivo", value: "" }

### bottom
- tab-bar (variant: State=Default)
  - ai_overridable: false

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Listado")
- filter-bar (variant: chips, filters: ["Todos","Categoría A","Categoría B"])
- card-item ×5
- tab-bar (variant: State=Default)

## Notas de aprobación
Template base para cualquier listado L1. Usar como punto de partida cuando no hay
template específico de dominio. Derivar variantes específicas desde aquí.
