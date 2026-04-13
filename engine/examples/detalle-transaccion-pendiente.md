# Detalle / Transacción pendiente
**pattern:** detalle
**status:** APPROVED
**score:** 0.88
**domain:** transacciones
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** detalle transacción, ver transacción, transacción pendiente, movimiento pendiente, operación en curso, pago pendiente, estado transacción, seguimiento pago

## Descripción
Pantalla de detalle de una transacción que aún no se ha completado. Muestra los datos del movimiento con badge en variante warning para indicar el estado, y un button-secondary para cancelar si la operación todavía lo permite. Es la referencia para cualquier detalle de operación en curso.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Detalle del movimiento")
  - ai_overridable: title

### content
- list-header (variant: default, title: "Datos de la operación")
  - ai_overridable: title
- card-item (variant: default, title: "Destinatario", subtitle: "Maria García", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Importe", value: "−150,00 €", show_chevron: false)
  - ai_overridable: title, value
- card-item (variant: default, title: "Fecha", subtitle: "13 abr 2026", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Concepto", subtitle: "Cena cumpleaños", show_chevron: false)
  - ai_overridable: title, subtitle
- badge (variant: warning, label: "Pendiente")
  - ai_overridable: label
- list-header (variant: default, title: "Estado")
  - ai_overridable: title
- notification-banner (variant: info, message: "Esta operación está siendo procesada. Puede tardar hasta 24 horas.")
  - ai_overridable: message

### bottom
- button-secondary (variant: default, label: "Cancelar operación")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Back, title: "Detalle del movimiento")
- list-header (variant: default, title: "Datos de la operación")
- card-item (variant: default, title: "Destinatario")
- card-item (variant: default, title: "Importe")
- card-item (variant: default, title: "Fecha")
- card-item (variant: default, title: "Concepto")
- badge (variant: warning, label: "Pendiente")
- list-header (variant: default, title: "Estado")
- notification-banner (variant: info)
- button-secondary (variant: default, label: "Cancelar operación")

## Notas de aprobación
El badge warning es obligatorio cuando el estado es pendiente — nunca omitir el indicador de estado en esta pantalla. El notification-banner info explica el tiempo estimado de procesamiento. El button-secondary de cancelar solo aparece si la operación admite cancelación — si ya no es posible cancelar, eliminar ese componente. No usar button-primary en detalle de transacción pendiente: no hay acción principal hasta que la operación se resuelva.
