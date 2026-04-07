# Confirmación / Eliminar cuenta
**pattern:** confirmacion
**status:** APPROVED
**score:** 0.89
**domain:** gestion-cuenta
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** eliminar cuenta, borrar cuenta, cerrar cuenta, baja cuenta, cancelar cuenta, cuenta definitiva, operación irreversible, destruir cuenta

## Descripción
Pantalla de confirmación para acciones destructivas e irreversibles sobre la cuenta del usuario. Usa modal-bottom-sheet en variante destructive y notification-banner de advertencia. Es la referencia para cualquier acción que no tiene vuelta atrás.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Eliminar cuenta")
  - ai_overridable: title

### content
- notification-banner (variant: warning)
  - ai_overridable: title, description
  - default_props: { title: "Esta acción es irreversible", description: "Una vez eliminada tu cuenta no podrás recuperar tus datos ni historial" }
- card-item (variant: default, title: "Titular", subtitle: "Pablo Reguera")
  - ai_overridable: subtitle
- card-item (variant: default, title: "Cuenta", subtitle: "****5678")
  - ai_overridable: subtitle
- modal-bottom-sheet (variant: destructive, title: "¿Eliminar cuenta definitivamente?", description: "Perderás todos tus datos, saldo y historial de forma permanente", confirm_label: "Sí, eliminar cuenta", cancel_label: "Cancelar")
  - ai_overridable: title, description, confirm_label, cancel_label

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Eliminar cuenta")
- notification-banner (variant: warning)
- card-item (variant: default, title: "Titular")
- card-item (variant: default, title: "Cuenta")
- modal-bottom-sheet (variant: destructive)

## Notas de aprobación
En acciones destructivas el modal-bottom-sheet siempre usa variant: destructive — nunca default. El notification-banner warning es obligatorio antes del modal para que el usuario tenga contexto del riesgo. El confirm_label debe ser explícito sobre la acción ("Sí, eliminar cuenta"), nunca genérico ("Aceptar" o "Confirmar").
