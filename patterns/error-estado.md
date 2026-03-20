# error-estado

## Descripción
Pantalla de error, estado vacío o pérdida de conexión. Informa al usuario de que algo ha salido mal y ofrece una acción de recuperación clara.

## Cuándo aplicar este pattern
- Error de red o sin conexión
- Error del servidor (500, timeout)
- Recurso no encontrado (404)
- Estado vacío inicial (el usuario no tiene datos todavía)
- Sesión expirada

## Componentes requeridos (en este orden)
1. navigation-header — variant: default o with-back según el contexto
2. empty-state — variant según el error: error, no-results, default

## Componentes opcionales
- button-primary — acción de recuperación: "Reintentar", "Volver al inicio", "Actualizar"
- notification-banner — información adicional sobre el error, variant: error o warning

## Reglas de composición
- navigation-header siempre presente — el usuario necesita poder navegar hacia atrás
- empty-state centrado verticalmente en el área disponible
- button-primary de recuperación siempre visible sin scroll
- NUNCA card-item, filter-bar ni input-text en pantalla de error

## Reglas de contenido
- Título del empty-state: humano y no técnico — "Algo ha salido mal", no "Error 500"
- Descripción breve explicando qué pasó y qué puede hacer el usuario
- CTA del button-primary: acción concreta — "Reintentar", "Ir al inicio"
- Nunca mostrar stack traces ni mensajes técnicos al usuario

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- card-item (no hay contenido que mostrar)
- filter-bar
- input-text
- tab-bar (solo si la pantalla de error es L1 o L0, en ese caso sí)
