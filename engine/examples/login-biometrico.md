# Login / Biométrico
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.90
**domain:** autenticacion
**fecha:** 2026-03-26
**nav_level:** L2
**match_keywords:** biométrico, Face ID, huella dactilar, Touch ID, autenticación biométrica, login biométrico, reconocimiento facial

## Descripción
Variante del login estándar con opción de autenticación biométrica. Añade button-secondary con la acción biométrica disponible (Face ID o Touch ID según dispositivo).

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
  - ai_overridable: false

### content
- input-text (variant: default, label: "Email")
  - ai_overridable: false
- input-text (variant: password, label: "Contraseña")
  - ai_overridable: false
- button-primary (variant: default, label: "Iniciar sesión")
  - ai_overridable: false
- button-secondary (variant: default, label: "Usar Face ID")
  - ai_overridable: label
  - default_props: { label: "Usar Face ID" }

### bottom

## Componentes
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
- input-text (variant: default, label: "Email")
- input-text (variant: password, label: "Contraseña")
- button-primary (variant: default, label: "Iniciar sesión")
- button-secondary (variant: default, label: "Usar Face ID")

## Notas de aprobación
El button-secondary biométrico siempre va DESPUÉS del button-primary. Nunca al revés — el login con credenciales es la acción principal.
