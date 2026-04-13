# Detalle / Transacción completada
**pattern:** detalle
**status:** APPROVED
**score:** 0.90
**domain:** transacciones
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** detalle transacción completada, movimiento completado, pago realizado, transferencia exitosa, historial movimiento, ver recibo, detalle movimiento historial, transacción finalizada

## Descripción
Pantalla de detalle de una transacción ya completada. Es el caso base del patrón detalle para movimientos del historial. Muestra todos los datos del movimiento con badge positive confirmando el estado. Sin acciones principales — la operación ya está cerrada.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Detalle del movimiento")
  - ai_overridable: title

### content
- badge (variant: positive, label: "Completada")
  - ai_overridable: label
- list-header (variant: default, title: "Datos del movimiento")
  - ai_overridable: title
- card-item (variant: default, title: "Destinatario", subtitle: "Maria García", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Importe", value: "−150,00 €", show_chevron: false)
  - ai_overridable: title, value
- card-item (variant: default, title: "Fecha", subtitle: "12 abr 2026 · 14:32h", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Concepto", subtitle: "Cena cumpleaños", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Referencia", subtitle: "REF20260412143200", show_chevron: false)
  - ai_overridable: title, subtitle
- list-header (variant: with-action, title: "Documentos", action_label: "Descargar recibo")
  - ai_overridable: title, action_label

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Detalle del movimiento")
- badge (variant: positive, label: "Completada")
- list-header (variant: default, title: "Datos del movimiento")
- card-item (variant: default, title: "Destinatario")
- card-item (variant: default, title: "Importe")
- card-item (variant: default, title: "Fecha")
- card-item (variant: default, title: "Concepto")
- card-item (variant: default, title: "Referencia")
- list-header (variant: with-action, title: "Documentos", action_label: "Descargar recibo")

## Notas de aprobación
En transacciones completadas no hay button-primary ni button-secondary en la zona inferior — la operación está cerrada. El badge positive va siempre en la parte superior del contenido, antes de los datos. La referencia de la transacción es un campo obligatorio en movimientos completados para que el usuario pueda hacer reclamaciones. El list-header with-action para descarga de recibo es opcional pero recomendado en transferencias salientes.
