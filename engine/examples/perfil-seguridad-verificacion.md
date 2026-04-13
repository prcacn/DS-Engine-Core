# Perfil / Seguridad y verificación
**pattern:** perfil-usuario
**status:** APPROVED
**score:** 0.87
**domain:** perfil
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** seguridad cuenta, verificación identidad, cambiar contraseña, seguridad perfil, autenticación, verificar identidad, 2FA, doble factor, nivel verificación, KYC pendiente

## Descripción
Pantalla de seguridad del perfil. Muestra el estado de verificación de la cuenta con un notification-banner warning si hay verificación pendiente. Acciones de seguridad disponibles como card-items navegables. Referencia para cualquier pantalla de seguridad o verificación de identidad.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Seguridad")
  - ai_overridable: title

### content
- notification-banner (variant: warning)
  - ai_overridable: title, description
  - default_props: { title: "Verificación pendiente", description: "Completa la verificación de identidad para acceder a todas las funciones" }
- list-header (variant: default, title: "Estado de verificación")
  - ai_overridable: title
- card-item (variant: default, title: "Verificación de identidad", subtitle: "Pendiente — sube tu DNI o pasaporte", show_chevron: true)
  - ai_overridable: title, subtitle
- list-header (variant: default, title: "Acceso y contraseña")
  - ai_overridable: title
- card-item (variant: default, title: "Cambiar contraseña", show_chevron: true)
  - ai_overridable: title
- card-item (variant: default, title: "Autenticación en dos pasos", subtitle: "Activada", show_chevron: true)
  - ai_overridable: title, subtitle

### bottom
- button-primary (variant: default, label: "Verificar identidad ahora")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Back, title: "Seguridad")
- notification-banner (variant: warning)
- list-header (variant: default, title: "Estado de verificación")
- card-item (variant: default, title: "Verificación de identidad")
- list-header (variant: default, title: "Acceso y contraseña")
- card-item (variant: default, title: "Cambiar contraseña")
- card-item (variant: default, title: "Autenticación en dos pasos")
- button-primary (variant: default, label: "Verificar identidad ahora")

## Notas de aprobación
El notification-banner warning solo aparece cuando hay una verificación pendiente — si la cuenta está completamente verificada, eliminarlo. El button-primary solo aparece si hay una acción crítica pendiente (verificación, actualización obligatoria). Los card-items de acceso y contraseña son siempre navegables (show_chevron: true) — llevan a pantallas propias de edición.
