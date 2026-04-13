# Lista / Resultados vacíos
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.89
**domain:** busqueda
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** sin resultados, búsqueda vacía, no se encontró, lista vacía, nada que mostrar, sin movimientos, sin transacciones, sin fondos, resultados vacíos, búsqueda sin resultados, 0 resultados

## Descripción
Estado vacío de una lista cuando la búsqueda o los filtros activos no devuelven resultados. El filter-bar permanece visible para que el usuario pueda cambiar los filtros. El empty-state con CTA ofrece una acción para salir del estado vacío. Referencia para cualquier lista sin resultados.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Resultados")
  - ai_overridable: title

### content
- filter-bar (variant: chips)
  - ai_overridable: filters
- empty-state (variant: no-results, title: "Sin resultados", description: "Prueba a cambiar los filtros o ampliar el periodo de búsqueda.", action_label: "Limpiar filtros")
  - ai_overridable: title, description, action_label

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Resultados")
- filter-bar (variant: chips)
- empty-state (variant: no-results, title: "Sin resultados", description: "Prueba a cambiar los filtros o ampliar el periodo de búsqueda.", action_label: "Limpiar filtros")

## Notas de aprobación
En listas vacías por filtros, el filter-bar siempre permanece visible — el usuario necesita poder cambiar los filtros sin salir de la pantalla. El empty-state usa variant: no-results (no variant: error, que es para fallos técnicos). El action_label del empty-state debe ser una acción constructiva ("Limpiar filtros", "Ver todos") — nunca "Cerrar" o "Volver". Sin card-items cuando la lista está vacía — no rellenar con contenido inventado o sugerencias no relacionadas.
