# Confirmación de transferencia
**pattern:** confirmacion
**status:** APPROVED
**score:** 0.94
**domain:** transferencias
**fecha:** 2026-03-20

## Descripción
Pantalla de confirmación del paso final de una transferencia bancaria.
Modal con resumen de la operación y botones de confirmar/cancelar.

## Componentes
- navigation-header (variant: with-back, title: "Confirmar transferencia")
- card-item ×3 (resumen: origen, destino, importe — readonly)
- modal-bottom-sheet (variant: confirmation, title: "¿Confirmar envío?")
- button-primary (variant: default, label: "Enviar transferencia")
- button-secondary (variant: default, label: "Cancelar")

## Notas de aprobación
Aprobada el 2026-03-20. modal-bottom-sheet obligatorio en confirmaciones destructivas.
