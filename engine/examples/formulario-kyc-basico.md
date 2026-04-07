# Formulario / KYC básico
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.87
**domain:** onboarding-kyc
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** KYC, verificación identidad, datos personales, onboarding, alta cliente, documentación, verificar identidad, cumplimiento, compliance

## Descripción
Formulario de recogida de datos básicos para el proceso KYC (Know Your Customer). Incluye campos obligatorios de identificación personal. El notification-banner informa del propósito regulatorio del proceso.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Verificación de identidad")
  - ai_overridable: title

### content
- notification-banner (variant: info)
  - ai_overridable: description
  - default_props: { title: "¿Por qué necesitamos esto?", description: "La normativa nos obliga a verificar tu identidad antes de activar tu cuenta" }
- input-text (variant: default, label: "Nombre completo")
  - ai_overridable: label
  - default_props: { placeholder: "Como aparece en tu documento" }
- input-text (variant: default, label: "Número de documento")
  - ai_overridable: label, placeholder
  - default_props: { placeholder: "DNI, NIE o pasaporte" }
- input-text (variant: default, label: "Fecha de nacimiento")
  - ai_overridable: false
  - default_props: { placeholder: "DD/MM/AAAA" }
- input-text (variant: default, label: "Nacionalidad")
  - ai_overridable: label
- button-primary (variant: default, label: "Verificar identidad")
  - ai_overridable: label
- button-secondary (variant: default, label: "Hacerlo más tarde")
  - ai_overridable: label

### bottom

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Verificación de identidad")
- notification-banner (variant: info)
- input-text (variant: default, label: "Nombre completo")
- input-text (variant: default, label: "Número de documento")
- input-text (variant: default, label: "Fecha de nacimiento")
- input-text (variant: default, label: "Nacionalidad")
- button-primary (variant: default, label: "Verificar identidad")
- button-secondary (variant: default, label: "Hacerlo más tarde")

## Notas de aprobación
El notification-banner explicativo es obligatorio en KYC — los usuarios abandonan si no entienden por qué se piden sus datos. El button-secondary "Hacerlo más tarde" es obligatorio para no bloquear el flujo — la verificación puede completarse después. La fecha de nacimiento nunca es ai_overridable por formato regulatorio.
