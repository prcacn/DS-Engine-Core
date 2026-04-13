# Lista / Notificaciones no leídas
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.87
**domain:** notificaciones
**fecha:** 2026-04-13
**nav_level:** L1
**match_keywords:** notificaciones no leídas, alertas nuevas, mensajes sin leer, centro notificaciones, bandeja entrada, alertas pendientes, notificaciones recientes, avisos nuevos, notificaciones app

## Descripción
Lista de notificaciones con indicador de no leídas. El badge en el list-header muestra el número de no leídas. Los card-items con estado destacado representan las notificaciones nuevas. Referencia para el centro de notificaciones de la aplicación.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Notificaciones")
  - ai_overridable: title
- tab-bar (variant: with-badge)
  - ai_overridable: false

### content
- list-header (variant: with-action, title: "Nuevas · 3", action_label: "Marcar todas como leídas")
  - ai_overridable: title, action_label
- card-item (variant: highlighted, title: "Transferencia recibida", subtitle: "Has recibido 250 € de María García", metadata: "Hace 5 min", show_chevron: true)
  - ai_overridable: title, subtitle, metadata
- card-item (variant: highlighted, title: "Alerta de seguridad", subtitle: "Nuevo acceso desde dispositivo desconocido", metadata: "Hace 1h", show_chevron: true)
  - ai_overridable: title, subtitle, metadata
- card-item (variant: highlighted, title: "Oferta disponible", subtitle: "Nuevo fondo con rentabilidad 4.2% TAE", metadata: "Hace 3h", show_chevron: true)
  - ai_overridable: title, subtitle, metadata
- list-header (variant: default, title: "Anteriores")
  - ai_overridable: title
- card-item (variant: default, title: "Resumen semanal", subtitle: "Tu actividad de la semana pasada", metadata: "Ayer", show_chevron: true)
  - ai_overridable: title, subtitle, metadata

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Notificaciones")
- tab-bar (variant: with-badge)
- list-header (variant: with-action, title: "Nuevas · 3", action_label: "Marcar todas como leídas")
- card-item (variant: highlighted, title: "Transferencia recibida")
- card-item (variant: highlighted, title: "Alerta de seguridad")
- card-item (variant: highlighted, title: "Oferta disponible")
- list-header (variant: default, title: "Anteriores")
- card-item (variant: default, title: "Resumen semanal")

## Notas de aprobación
Las notificaciones no leídas usan siempre card-item variant: highlighted — las leídas usan variant: default. El list-header with-action para "Marcar todas como leídas" es obligatorio cuando hay no leídas — permite limpiar el estado de un golpe. El título del list-header muestra el contador de no leídas (ej: "Nuevas · 3"). Sin filter-bar en esta pantalla — el filtrado se hace mediante tab-bar (Todas / No leídas / Alertas).
