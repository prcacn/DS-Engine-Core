# detalle

## Descripción
Pantalla de detalle de un item. Muestra la información completa de un elemento al que se ha navegado desde un listado. Puede incluir acciones sobre ese item.

## Cuándo aplicar este pattern
- Ver el detalle de un producto, fondo, transacción o usuario
- Cuando un card-item de un listado lleva a más información
- Pantallas de perfil de un elemento específico

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2 — arrow-left izquierda)
2. card-item × N — información del detalle en formato de filas de datos (show_chevron: false)

## Componentes opcionales
- button-primary — si hay una acción principal sobre el item: "Contratar", "Transferir", "Editar"
- button-secondary — si hay una acción alternativa
- modal-bottom-sheet — para confirmar la acción principal si es irreversible

## Reglas de composición
- navigation-header siempre primero con variant: with-back
- Los card-item en detalle tienen show_chevron: false (no son navegables)
- button-primary si existe, siempre fijo al final de la pantalla
- No más de 1 button-primary en la pantalla de detalle
- Si hay acción principal irreversible: button-primary abre modal-bottom-sheet de confirmación

## Reglas de contenido
- El title del navigation-header es el nombre del item específico, no la categoría
- Las filas de datos (card-item) se agrupan por tema con separadores visuales
- El button-primary.label es la acción sobre ese item específico

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar filter-bar en pantallas de detalle
- No usar input-text salvo en modo edición (cambiaría al pattern formulario-simple)
- No usar empty-state — si hay detalle, hay contenido
