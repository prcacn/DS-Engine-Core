# Lista de transacciones
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.88
**domain:** transacciones
**fecha:** 2026-03-24
**nav_level:** L1
**match_keywords:** transacciones, movimientos, historial, pagos, cobros

## Descripción
Historial de transacciones con filtros por tipo. Usa card-item/financial para
mostrar importes con signo. La IA puede cambiar la cantidad de items y los filtros.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Movimientos")
  - ai_overridable: title

### content
- filter-bar (variant: chips, filters: ["Todos","Ingresos","Gastos","Pendientes"])
  - ai_overridable: filters
- card-item/financial ×8
  - ai_overridable: quantity (min: 1, max: 20)
  - default_props: { title: "Título", subtitle: "Hoy", value: "€0,00" }

### bottom
- tab-bar (variant: State=Default)
  - ai_overridable: false

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Movimientos")
- filter-bar (variant: chips, filters: ["Todos","Ingresos","Gastos","Pendientes"])
- card-item/financial ×8
- tab-bar (variant: State=Default)

## Notas de aprobación
Base para historial de movimientos financieros. Derivar variantes por geografía
(ES, MX, CO) con formatos de moneda distintos.
