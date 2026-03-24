# Detalle de item
**pattern:** detalle
**status:** APPROVED
**score:** 0.86
**domain:** detalle
**fecha:** 2026-03-24
**nav_level:** L2
**match_keywords:** detalle, ficha, ver más, información de, resumen de, datos de

## Descripción
Pantalla de detalle de un elemento navegado desde un listado L1.
Siempre L2 — con back button. La IA puede cambiar el número de rows
de datos y el texto del CTA.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Detalle")
  - ai_overridable: title

### content
- list-header (variant: State=Default, title: "Información")
  - ai_overridable: title
- card-item ×4
  - ai_overridable: quantity (min: 2, max: 8)
  - default_props: { title: "Campo", subtitle: "Valor", show_chevron: false }

### bottom
- button-primary (variant: State=Predeterminada, label: "Acción principal")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Modal, title: "Detalle")
- list-header (variant: State=Default, title: "Información")
- card-item ×4
- button-primary (variant: State=Predeterminada, label: "Acción principal")

## Notas de aprobación
Base para cualquier pantalla de detalle L2. Derivar variantes para:
detalle-fondo, detalle-transaccion, detalle-cuenta.
