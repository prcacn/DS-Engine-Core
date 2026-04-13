# Perfil / Datos personales
**pattern:** perfil-usuario
**status:** APPROVED
**score:** 0.89
**domain:** perfil
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** datos personales, mi perfil, información personal, ver perfil, nombre usuario, dirección, datos cuenta, datos usuario, mi información, perfil datos

## Descripción
Pantalla de visualización de datos personales del usuario. Solo lectura — los card-items muestran los datos pero no son editables desde aquí. La edición se accede desde el list-header con acción. Referencia para cualquier pantalla de perfil con datos personales.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Datos personales")
  - ai_overridable: title

### content
- list-header (variant: with-action, title: "Información personal", action_label: "Editar")
  - ai_overridable: title, action_label
- card-item (variant: default, title: "Nombre completo", subtitle: "Pablo Reguera", show_chevron: false)
  - ai_overridable: subtitle
- card-item (variant: default, title: "Email", subtitle: "pablo@ejemplo.com", show_chevron: false)
  - ai_overridable: subtitle
- card-item (variant: default, title: "Teléfono", subtitle: "+34 612 345 678", show_chevron: false)
  - ai_overridable: subtitle
- card-item (variant: default, title: "Fecha de nacimiento", subtitle: "15 mar 1985", show_chevron: false)
  - ai_overridable: subtitle
- list-header (variant: with-action, title: "Dirección", action_label: "Editar")
  - ai_overridable: title, action_label
- card-item (variant: default, title: "País", subtitle: "España", show_chevron: false)
  - ai_overridable: subtitle
- card-item (variant: default, title: "Ciudad", subtitle: "Madrid", show_chevron: false)
  - ai_overridable: subtitle

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Datos personales")
- list-header (variant: with-action, title: "Información personal", action_label: "Editar")
- card-item (variant: default, title: "Nombre completo")
- card-item (variant: default, title: "Email")
- card-item (variant: default, title: "Teléfono")
- card-item (variant: default, title: "Fecha de nacimiento")
- list-header (variant: with-action, title: "Dirección", action_label: "Editar")
- card-item (variant: default, title: "País")
- card-item (variant: default, title: "Ciudad")

## Notas de aprobación
Los datos personales se muestran siempre en modo lectura — nunca inputs directamente en esta pantalla. La edición se accede desde el action_label del list-header, que navega a una pantalla de edición independiente. Sin button-primary en el footer — no hay acción principal en una pantalla de solo lectura. Todos los card-items con show_chevron: false para dejar claro que no son navegables.
