# Onboarding / Bienvenida nueva cuenta
**pattern:** onboarding
**status:** APPROVED
**score:** 0.88
**domain:** onboarding
**fecha:** 2026-04-13
**nav_level:** L1
**match_keywords:** bienvenida nueva cuenta, primer acceso, nuevo usuario, pantalla de inicio onboarding, welcome, empezar cuenta, alta cuenta, registro completado, onboarding inicio

## Descripción
Primera pantalla del flujo de onboarding tras crear una cuenta. Sin inputs — el usuario solo avanza. Comunica los beneficios principales y ofrece un único CTA para comenzar. Incluye notification-banner informativo con el siguiente paso.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Bienvenido")
  - ai_overridable: title

### content
- notification-banner (variant: info)
  - ai_overridable: title, description
  - default_props: { title: "Tu cuenta está lista", description: "Completa tu perfil para empezar a operar" }
- list-header (variant: default, title: "¿Qué puedes hacer?")
  - ai_overridable: title
- card-item (variant: default, title: "Enviar dinero", subtitle: "Transferencias nacionales e internacionales", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Invertir", subtitle: "Fondos y productos de inversión adaptados a ti", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Controlar tus gastos", subtitle: "Categorización automática de movimientos", show_chevron: false)
  - ai_overridable: title, subtitle

### bottom
- button-primary (variant: default, label: "Empezar ahora")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Bienvenido")
- notification-banner (variant: info)
- list-header (variant: default, title: "¿Qué puedes hacer?")
- card-item (variant: default, title: "Enviar dinero")
- card-item (variant: default, title: "Invertir")
- card-item (variant: default, title: "Controlar tus gastos")
- button-primary (variant: default, label: "Empezar ahora")

## Notas de aprobación
En la pantalla de bienvenida nunca hay inputs — el usuario no debe rellenar nada en este momento. El notification-banner info es obligatorio para comunicar el estado de la cuenta y el siguiente paso. El button-primary es el único CTA visible — no añadir button-secondary que distraiga. Los card-items son informativos (show_chevron: false), no navegables.
