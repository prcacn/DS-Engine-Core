# Confirmación / Transferencia con resumen
**pattern:** confirmacion
**status:** APPROVED
**score:** 0.91
**domain:** transferencias
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** confirmar transferencia, resumen transferencia, revisar envío, datos transferencia, confirmar envío, operación pendiente, autorizar transferencia

## Descripción
Pantalla de confirmación de transferencia con resumen visual de los datos antes del modal. El usuario ve origen, destino e importe en card-items de solo lectura antes de confirmar. Es la variante estándar para cualquier confirmación de pago o envío.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Confirmar transferencia")
  - ai_overridable: title

### content
- list-header (variant: default, title: "Resumen de la operación")
  - ai_overridable: title
- card-item (variant: default, title: "Cuenta origen", subtitle: "****1234", value: "−250,00 €")
  - ai_overridable: title, subtitle, value
- card-item (variant: default, title: "Beneficiario", subtitle: "ES12 3456 7890 1234 5678 90")
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Importe", value: "250,00 €")
  - ai_overridable: title, value
- card-item (variant: default, title: "Concepto", subtitle: "Pago alquiler")
  - ai_overridable: title, subtitle
- modal-bottom-sheet (variant: default, title: "¿Confirmar el envío?", description: "Esta operación no se puede deshacer", confirm_label: "Enviar ahora", cancel_label: "Cancelar")
  - ai_overridable: title, description, confirm_label, cancel_label

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Confirmar transferencia")
- list-header (variant: default, title: "Resumen de la operación")
- card-item (variant: default, title: "Cuenta origen")
- card-item (variant: default, title: "Beneficiario")
- card-item (variant: default, title: "Importe")
- card-item (variant: default, title: "Concepto")
- modal-bottom-sheet (variant: default)

## Notas de aprobación
Los card-items del resumen son siempre de solo lectura — nunca editables en esta pantalla. El modal-bottom-sheet es obligatorio en confirmaciones de transferencia. El description del modal debe recordar siempre que la operación no se puede deshacer.
