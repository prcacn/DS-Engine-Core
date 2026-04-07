# Formulario / Login México
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.88
**domain:** autenticacion-mexico
**fecha:** 2026-04-07
**nav_level:** L2
**match_keywords:** login México, CURP, teléfono México, autenticación México, acceso México, 10 dígitos, número celular México

## Descripción
Variante del login estándar adaptada para el mercado mexicano. Sustituye el input de email por input de teléfono móvil (10 dígitos, formato mexicano). Incluye aviso de normativa local.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
  - ai_overridable: false

### content
- notification-banner (variant: info)
  - ai_overridable: title, description
  - default_props: { title: "Acceso para México", description: "Ingresa tu número de celular a 10 dígitos" }
- input-text (variant: numeric, label: "Número de celular")
  - ai_overridable: label, placeholder
  - default_props: { placeholder: "55 1234 5678", helper_text: "Sin el +52" }
- input-text (variant: password, label: "Contraseña")
  - ai_overridable: false
- button-primary (variant: default, label: "Iniciar sesión")
  - ai_overridable: false

### bottom

## Componentes
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
- notification-banner (variant: info)
- input-text (variant: numeric, label: "Número de celular")
- input-text (variant: password, label: "Contraseña")
- button-primary (variant: default, label: "Iniciar sesión")

## Notas de aprobación
En México nunca usar input de email como identificador principal — usar siempre teléfono. El helper_text "Sin el +52" es obligatorio para evitar errores de formato. El notification-banner informativo es obligatorio en esta variante.
