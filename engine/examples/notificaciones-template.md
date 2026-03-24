# Centro de notificaciones
**pattern:** notificaciones
**status:** APPROVED
**score:** 0.84
**domain:** notificaciones
**fecha:** 2026-03-24
**nav_level:** L1
**match_keywords:** notificaciones, alertas, avisos, mensajes, centro de notificaciones

## Descripción
Lista de notificaciones y alertas del sistema. L1 — accesible desde tab-bar.
La IA puede variar el número de banners según el brief.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Notificaciones")
  - ai_overridable: title

### content
- list-header (variant: State=Default, title: "Recientes")
  - ai_overridable: false
- notification-banner ×3
  - ai_overridable: quantity (min: 1, max: 5)
  - default_props: { title: "Alerta", message: "Descripción de la notificación", variant: "info" }

### bottom
- tab-bar (variant: State=Default)
  - ai_overridable: false

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Notificaciones")
- list-header (variant: State=Default, title: "Recientes")
- notification-banner ×3
- tab-bar (variant: State=Default)

## Notas de aprobación
Template base para centro de notificaciones. El número de banners es
orientativo — en producción vendrán del backend. Máximo 5 por pantalla.
