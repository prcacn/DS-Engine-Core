# Onboarding / Configuración de notificaciones
**pattern:** onboarding
**status:** APPROVED
**score:** 0.87
**domain:** onboarding
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** configurar notificaciones, activar alertas, permisos notificaciones, onboarding notificaciones, configuración alertas, avisos cuenta, notificaciones push, paso onboarding

## Descripción
Pantalla de configuración de notificaciones dentro del flujo de onboarding. El usuario elige qué alertas quiere recibir. Sin inputs de texto — la selección es implícita. Botón primario para confirmar y avanzar, secundario para saltar este paso.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Notificaciones")
  - ai_overridable: title

### content
- notification-banner (variant: info)
  - ai_overridable: title, description
  - default_props: { title: "Mantente informado", description: "Activa las alertas que más te interesen. Puedes cambiarlas cuando quieras." }
- list-header (variant: default, title: "Elige tus alertas")
  - ai_overridable: title
- card-item (variant: default, title: "Movimientos de cuenta", subtitle: "Cada vez que haya un cargo o abono", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Alertas de seguridad", subtitle: "Accesos y cambios en tu cuenta", show_chevron: false)
  - ai_overridable: title, subtitle
- card-item (variant: default, title: "Novedades y ofertas", subtitle: "Nuevos productos adaptados a ti", show_chevron: false)
  - ai_overridable: title, subtitle

### bottom
- button-primary (variant: default, label: "Activar notificaciones")
  - ai_overridable: label
- button-secondary (variant: default, label: "Ahora no")
  - ai_overridable: label

## Componentes
- navigation-header (variant: Type=Back, title: "Notificaciones")
- notification-banner (variant: info)
- list-header (variant: default, title: "Elige tus alertas")
- card-item (variant: default, title: "Movimientos de cuenta")
- card-item (variant: default, title: "Alertas de seguridad")
- card-item (variant: default, title: "Novedades y ofertas")
- button-primary (variant: default, label: "Activar notificaciones")
- button-secondary (variant: default, label: "Ahora no")

## Notas de aprobación
En pasos de onboarding opcionales siempre incluir button-secondary "Ahora no" o "Saltar" — nunca forzar al usuario a completar un paso para avanzar. El notification-banner info explica el valor antes de pedir el permiso — nunca pedir permisos sin contexto previo. Los card-items son informativos (sin chevron), no son toggles — la selección real la hace el sistema operativo al pulsar el botón primario.
