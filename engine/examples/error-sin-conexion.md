# Error / Sin conexión
**pattern:** error-estado
**status:** APPROVED
**score:** 0.90
**domain:** errores
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** sin conexión, error de red, no hay internet, error conexión, fallo de red, sin internet, problema de conexión, error carga, no se puede conectar, timeout, servicio no disponible

## Descripción
Pantalla de error cuando no hay conexión a internet o el servicio no está disponible. El empty-state explica el problema y ofrece un botón para reintentar. Es la referencia para cualquier error de conectividad o fallo técnico recuperable.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Error")
  - ai_overridable: title

### content
- empty-state (variant: error, title: "Sin conexión", description: "Comprueba tu conexión a internet e inténtalo de nuevo.", action_label: "Reintentar")
  - ai_overridable: title, description, action_label

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Error")
- empty-state (variant: error, title: "Sin conexión", description: "Comprueba tu conexión a internet e inténtalo de nuevo.", action_label: "Reintentar")

## Notas de aprobación
En errores de conexión el empty-state siempre usa variant: error — nunca default ni no-results. El action_label debe ser siempre una acción concreta ("Reintentar", "Volver a intentarlo") — nunca "Aceptar" o "Cerrar". Sin notification-banner adicional — el empty-state es suficiente para comunicar el error. Sin button-primary en el footer — la acción de reintento va dentro del empty-state como action_label.
