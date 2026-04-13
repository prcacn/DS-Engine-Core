# Detalle / Producto restringido
**pattern:** detalle
**status:** APPROVED
**score:** 0.87
**domain:** productos-financieros
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** producto restringido, acceso bloqueado, contenido no disponible, producto no contratado, fondo bloqueado, sin acceso, perfil inversor insuficiente, restricción de acceso, producto exclusivo

## Descripción
Pantalla de detalle cuando el usuario no tiene acceso al producto que intenta ver. Reemplaza el contenido habitual del detalle por un empty-state en variante locked. Es la referencia para cualquier pantalla de detalle donde el acceso está restringido por perfil, saldo, contratación o normativa.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Detalle del producto")
  - ai_overridable: title

### content
- notification-banner (variant: warning, title: "Acceso restringido", message: "Este producto no está disponible para tu perfil actual")
  - ai_overridable: title, message
  - default_props: { title: "Acceso restringido", message: "Este producto no está disponible para tu perfil actual" }
- empty-state (variant: locked, title: "Producto no disponible", description: "No tienes acceso a este producto. Contacta con tu gestor para más información.", action_label: "Contactar gestor")
  - ai_overridable: title, description, action_label

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Detalle del producto")
- notification-banner (variant: warning)
- empty-state (variant: locked)

## Notas de aprobación
Cuando el acceso está restringido, NO mostrar ningún dato del producto — ni nombre, ni rentabilidad, ni nada. El empty-state locked es la única forma de comunicar la restricción en una pantalla de detalle. El notification-banner warning explica el motivo antes del empty-state: primero el contexto, luego el bloqueo. El action_label del empty-state debe ser una acción real disponible para el usuario — nunca "Volver" como única opción si hay algo que el usuario pueda hacer.
