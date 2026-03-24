# Login
**pattern:** formulario-simple
**status:** APPROVED
**score:** 0.91
**domain:** login
**fecha:** 2026-03-24
**nav_level:** L2
**match_keywords:** login, iniciar sesión, entrar, acceder, email, contraseña, password

## Descripción
Pantalla de inicio de sesión. Campos fijos: email y contraseña. La IA puede
adaptar los textos según contexto (geografía, marca) pero no la estructura.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
  - ai_overridable: title

### content
- input-text ×1
  - ai_overridable: false
  - default_props: { label: "Email", placeholder: "tu@email.com", type: "email" }
- input-text ×1
  - ai_overridable: false
  - default_props: { label: "Contraseña", placeholder: "••••••••", type: "password" }

### bottom
- button-primary (variant: State=Predeterminada, label: "Entrar")
  - ai_overridable: label
- button-secondary (variant: State=Predeterminada, label: "¿Olvidaste tu contraseña?")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Modal, title: "Iniciar sesión")
- input-text ×2
- button-primary (variant: State=Predeterminada, label: "Entrar")
- button-secondary (variant: State=Predeterminada, label: "¿Olvidaste tu contraseña?")

## Notas de aprobación
Estructura de login estándar. No añadir campos adicionales sin revisión.
Variantes: login/biometrico, login/mexico (teléfono en lugar de email).
