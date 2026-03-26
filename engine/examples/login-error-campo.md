# Login / Error de campo
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.88
**domain:** autenticacion
**fecha:** 2026-03-26
**nav_level:** L2
**match_keywords:** login error, campo incorrecto, credenciales erróneas, contraseña incorrecta, email inválido, error validación, intento fallido

## Descripción
Variante del login estándar con estado de error en un campo. Muestra notification-banner de error y el campo afectado en estado error. Base para cualquier variante de login con feedback de error.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
  - ai_overridable: false

### content
- notification-banner (variant: error)
  - ai_overridable: title, description
  - default_props: { title: "Credenciales incorrectas", description: "Revisa tu email y contraseña" }
- input-text (variant: error, label: "Email")
  - ai_overridable: label, variant
- input-text (variant: password, label: "Contraseña")
  - ai_overridable: false
- button-primary (variant: default, label: "Iniciar sesión")
  - ai_overridable: false

### bottom

## Componentes
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
- notification-banner (variant: error)
- input-text (variant: error, label: "Email")
- input-text (variant: password, label: "Contraseña")
- button-primary (variant: default, label: "Iniciar sesión")

## Notas de aprobación
Variante aprobada del login estándar. El notification-banner de error es obligatorio — nunca mostrar solo el campo en estado error sin el banner superior.
