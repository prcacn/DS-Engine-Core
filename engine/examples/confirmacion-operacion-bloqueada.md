# Confirmación / Operación bloqueada
**pattern:** confirmacion
**status:** APPROVED
**score:** 0.86
**domain:** restricciones-acceso
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** operación bloqueada, acceso restringido, sin permisos, operación no disponible, cuenta bloqueada, límite superado, operación denegada, restricción operativa

## Descripción
Variante de confirmación cuando la operación no puede completarse por una restricción del sistema (límite, permisos, bloqueo regulatorio). El modal-bottom-sheet se reemplaza por notification-banner de error con explicación del bloqueo. No hay acción de confirmación disponible.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Operación no disponible")
  - ai_overridable: title

### content
- notification-banner (variant: error)
  - ai_overridable: title, description
  - default_props: { title: "No puedes realizar esta operación", description: "Has superado el límite diario de transferencias. Podrás operar de nuevo mañana." }
- card-item (variant: disabled, title: "Operación solicitada")
  - ai_overridable: title, subtitle
- button-secondary (variant: default, label: "Volver al inicio")
  - ai_overridable: label

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Operación no disponible")
- notification-banner (variant: error)
- card-item (variant: disabled)
- button-secondary (variant: default, label: "Volver al inicio")

## Notas de aprobación
Cuando la operación está bloqueada NO se usa modal-bottom-sheet — se reemplaza por notification-banner de error. El card-item de la operación va siempre en variant: disabled para reforzar visualmente que no está disponible. Solo se muestra button-secondary de salida, nunca button-primary — no hay acción principal posible.
