# notificaciones

## Descripción
Lista de alertas, avisos y mensajes del sistema. Presenta las notificaciones del usuario en orden cronológico inverso. Siempre lleva tab-bar por ser L1.

## Cuándo aplicar este pattern
- Centro de notificaciones o actividad
- Lista de alertas pendientes
- Mensajes del sistema o de operaciones recientes

## Componentes requeridos (en este orden)
1. navigation-header — variant: default (L1 — título "Notificaciones" o "Actividad")
2. notification-banner × N — mínimo 1, máximo 5 por carga
3. tab-bar — SIEMPRE en L1. sticky en la parte inferior

## Componentes opcionales
- filter-bar — para filtrar por tipo: "Todas", "Alertas", "Operaciones", "Sistema"
- list-header — para separar notificaciones por fecha: "Hoy", "Esta semana"
- empty-state — si no hay notificaciones, variant: default con mensaje informativo
- badge — contador de no leídas en el tab-bar

## Reglas de composición
- navigation-header sin back (L1)
- tab-bar obligatorio
- notification-banner y empty-state son mutuamente excluyentes
- Si hay filter-bar, va inmediatamente debajo del navigation-header
- list-header separa grupos por fecha cuando hay muchas notificaciones

## Reglas de contenido
- Cada notification-banner muestra: tipo (icono), título, descripción corta, tiempo relativo
- Agrupar por fecha con list-header si hay más de 10 notificaciones
- Marcar las no leídas visualmente con un punto o fondo diferenciado
- CTA en notification-banner solo si hay acción directa disponible

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- card-item (usar notification-banner para este patrón)
- input-text
- modal-bottom-sheet en la vista principal
