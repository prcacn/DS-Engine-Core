# Lista de fondos ESG
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.87
**domain:** inversion-sostenible
**fecha:** 2026-03-26
**nav_level:** L1
**match_keywords:** ESG, sostenible, sostenibilidad, fondos verdes, inversión responsable, badge ESG, filtro sostenibles, criterios ESG

## Descripción
Variante de lista de fondos con filtro ESG y badge de sostenibilidad en los card-item. Muestra solo fondos con criterios ESG activos por defecto.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Fondos sostenibles")
  - ai_overridable: title

### content
- filter-bar (variant: chips)
  - ai_overridable: false
- card-item/financial ×5
  - ai_overridable: true
  - quantity_range: { min: 1, max: 20 }
  - default_props: { badge: "ESG", trend: "positive" }
- empty-state (variant: default)
  - ai_overridable: false

### bottom
- tab-bar (variant: default)
  - ai_overridable: false

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Fondos sostenibles")
- filter-bar (variant: chips)
- card-item/financial (badge: ESG)
- empty-state
- tab-bar

## Notas de aprobación
El filtro "Sostenibles" debe estar activo por defecto. El badge ESG en card-item es obligatorio en esta variante — no se puede omitir.
