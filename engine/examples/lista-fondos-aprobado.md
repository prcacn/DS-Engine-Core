# Lista de fondos de inversión
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.89
**domain:** fondos
**fecha:** 2026-03-23
**nav_level:** L1

## Descripción
Listado de fondos de inversión disponibles con filtros por categoría.
Pantalla de sección L1 — accesible desde tab-bar.

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Fondos")
- filter-bar (variant: chips, filters: ["Todos","Renta fija","Acciones","Mixtos","ESG"])
- card-item ×5 (fondos con rentabilidad y badge de riesgo)
- empty-state (variant: no-results, action_label: "Limpiar filtros")
- tab-bar (variant: default)

## Notas de aprobación
Aprobada como pantalla base de listado de fondos. Base para variante fondos/colombia y fondos/esg.
