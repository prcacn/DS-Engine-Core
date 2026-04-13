# Error / Acceso restringido
**pattern:** error-estado
**status:** APPROVED
**score:** 0.88
**domain:** errores
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** acceso restringido, sin permisos, acceso denegado, no autorizado, funcionalidad bloqueada, cuenta bloqueada, restricción acceso, perfil sin acceso, rol insuficiente, sección bloqueada

## Descripción
Pantalla de acceso denegado cuando el usuario no tiene permisos para ver una sección o función. El empty-state locked no ofrece acción de reintento — el usuario no puede desbloquear esto por sí mismo. Sin CTA de acción principal — solo navegación de vuelta.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Acceso restringido")
  - ai_overridable: title

### content
- empty-state (variant: locked, title: "No tienes acceso a esta sección", description: "Contacta con soporte si crees que esto es un error.")
  - ai_overridable: title, description

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Acceso restringido")
- empty-state (variant: locked, title: "No tienes acceso a esta sección", description: "Contacta con soporte si crees que esto es un error.")

## Notas de aprobación
Acceso restringido usa siempre empty-state variant: locked — nunca variant: error (ese es para fallos técnicos). Sin action_label en el empty-state cuando el usuario no puede resolver el problema por sí mismo — no frustrar al usuario con un botón que no lleva a ningún sitio. Sin button-primary en el footer. La única salida es la flecha de back del navigation-header. No añadir notification-banner — el empty-state locked ya comunica la restricción con suficiente claridad.
