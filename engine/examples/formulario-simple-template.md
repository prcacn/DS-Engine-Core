# Formulario simple
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.87
**domain:** formulario
**fecha:** 2026-03-24
**nav_level:** L2
**match_keywords:** formulario, form, editar, datos, campos, rellenar

## Descripción
Formulario genérico con inputs y CTA principal. Pantalla L2 — siempre con back button.
La IA puede cambiar los campos, labels y el texto del CTA según el brief.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Formulario")
  - ai_overridable: title

### content
- list-header (variant: State=Default, title: "Datos")
  - ai_overridable: title
- input-text ×3
  - ai_overridable: quantity (min: 1, max: 8)
  - default_props: { label: "Campo", placeholder: "Escribe aquí" }

### bottom
- button-primary (variant: State=Predeterminada, label: "Continuar")
  - ai_overridable: label
- button-secondary (variant: State=Predeterminada, label: "Cancelar")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Modal, title: "Formulario")
- list-header (variant: State=Default, title: "Datos")
- input-text ×3
- button-primary (variant: State=Predeterminada, label: "Continuar")
- button-secondary (variant: State=Predeterminada, label: "Cancelar")

## Notas de aprobación
Template base para cualquier formulario L2. Derivar variantes para login, registro,
edición de perfil, KYC, etc. El button-secondary es opcional — omitir si el flujo
no permite cancelar.
