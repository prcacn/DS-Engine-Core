# onboarding

## Descripción
Pantalla de bienvenida y primeros pasos para usuarios nuevos. Presenta el valor de la aplicación y guía al usuario hacia su primera acción. Nunca lleva tab-bar ni navegación compleja.

## Cuándo aplicar este pattern
- Primera vez que el usuario abre la app tras registrarse
- Bienvenida tras completar el registro
- Introducción a una funcionalidad nueva importante

## Componentes requeridos (en este orden)
1. navigation-header — variant: close (L0 onboarding — solo cierre, sin back)
2. button-primary — acción principal de avance: "Empezar", "Continuar", "Crear cuenta"

## Componentes opcionales
- notification-banner — aviso informativo si hay algo importante antes de empezar
- card-item — para mostrar beneficios o características en lista

## Reglas de composición
- navigation-header sin back ni menú — solo cierre opcional
- NUNCA tab-bar en onboarding — el usuario aún no está en la app
- NUNCA filter-bar — no hay exploración en onboarding
- button-primary siempre visible sin scroll si es posible
- button-secondary solo para "Omitir" o "Ya tengo cuenta"

## Reglas de contenido
- Título orientado al beneficio, no a la acción: "Tu dinero, siempre a mano"
- CTA claro y específico: "Crear cuenta gratis", no "Continuar"
- Máximo 3 puntos de valor si se muestran beneficios

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- tab-bar (el usuario no está autenticado aún)
- filter-bar
- modal-bottom-sheet
- input-text (los formularios van en formulario-simple)
