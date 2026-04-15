# movements-set

## Node ID en Figma
307:1165

## Descripción
Bloque agrupado de movimientos bajo un encabezado de fecha. Combina un header con título y fecha y una lista de card-item/financial. Se usa en pantallas de historial y dashboard para agrupar transacciones por día.

## Metadata
figma_id: 307:1165

## Cuándo usarlo
- Historial de movimientos agrupado por fecha
- Sección de actividad reciente en dashboard
- Listado de transacciones con contexto temporal

## Cuándo NO usarlo
- Un único movimiento sin agrupación — usar card-item/financial directamente
- Movimientos sin fecha — usar comp-list sin header
- Más de 7-8 items por grupo — paginar o añadir "ver más"

## Propiedades
| Propiedad | Tipo | Valores | Default |
|---|---|---|---|
| header_title | string | — | "Hoy" |
| header_date | string | — | "10 Abr. 2026" |
| items | array | card-item/financial[] | — |

## Restricciones
- Siempre mostrar header_title y header_date juntos
- Los items del grupo deben pertenecer al mismo día
- header_title puede ser relativo (Hoy, Ayer) o el nombre del día
- No mezclar movimientos de distintas fechas en el mismo movements-set
