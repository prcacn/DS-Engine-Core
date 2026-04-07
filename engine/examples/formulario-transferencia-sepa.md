# Formulario / Transferencia SEPA
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.89
**domain:** transferencias-sepa
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** transferencia SEPA, IBAN, transferencia Europa, enviar dinero Europa, zona euro, transferencia bancaria, SEPA, BIC, SWIFT

## Descripción
Formulario de transferencia bancaria para zona SEPA. Incluye campo IBAN con validación y helper text de normativa europea. El notification-banner informa del plazo de ejecución regulatorio (D+1).

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Nueva transferencia")
  - ai_overridable: title

### content
- input-text (variant: default, label: "Beneficiario")
  - ai_overridable: label, placeholder
  - default_props: { placeholder: "Nombre completo del destinatario" }
- input-text (variant: default, label: "IBAN")
  - ai_overridable: false
  - default_props: { placeholder: "ES00 0000 0000 0000 0000 0000", helper_text: "24 caracteres, empieza por ES" }
- input-text (variant: numeric, label: "Importe")
  - ai_overridable: label
  - default_props: { placeholder: "0,00", helper_text: "En euros" }
- input-text (variant: default, label: "Concepto")
  - ai_overridable: label, placeholder
  - default_props: { placeholder: "Opcional" }
- notification-banner (variant: info)
  - ai_overridable: false
  - default_props: { title: "Plazo de ejecución", description: "Las transferencias SEPA se ejecutan en 1 día hábil (D+1)" }
- button-primary (variant: default, label: "Continuar")
  - ai_overridable: label

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Nueva transferencia")
- input-text (variant: default, label: "Beneficiario")
- input-text (variant: default, label: "IBAN")
- input-text (variant: numeric, label: "Importe")
- input-text (variant: default, label: "Concepto")
- notification-banner (variant: info)
- button-primary (variant: default, label: "Continuar")

## Notas de aprobación
El campo IBAN nunca es ai_overridable — el formato y helper_text son fijos por normativa. El notification-banner de plazo D+1 es obligatorio en toda transferencia SEPA. El botón dice "Continuar", no "Enviar" — la acción final está en la pantalla de confirmación.
