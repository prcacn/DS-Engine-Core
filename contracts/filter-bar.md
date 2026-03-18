# filter-bar

## Descripción
Barra de filtros horizontales con scroll. Permite al usuario reducir el conjunto de items visibles en un listado seleccionando una o varias categorías. Siempre aparece anclada debajo del navigation-header.

## Propiedades
| Propiedad      | Tipo     | Valores posibles         | Valor por defecto |
|----------------|----------|--------------------------|-------------------|
| filters        | array    | Lista de strings         | []                |
| multi_select   | boolean  | true, false              | false             |
| show_count     | boolean  | true, false              | false             |
| default_filter | string   | Cualquier valor del array| "Todos"           |
| variant        | enum     | chips, tabs              | chips             |

## Cuándo usarlo
- En pantallas de listado donde el contenido puede categorizarse
- Cuando hay entre 2 y 8 categorías de filtrado
- Para filtros de primer nivel que el usuario usa frecuentemente
- Siempre que el listado tenga más de 10 items en total

## Cuándo NO usarlo
- Con menos de 2 filtros (no tiene sentido filtrar con una sola opción)
- Con más de 8 filtros — usa un panel de filtros avanzados en su lugar
- En pantallas de formulario
- En pantallas de detalle
- Junto a search-bar en la misma posición — search-bar va siempre encima

## Restricciones
- Siempre debajo del navigation-header, nunca flotante
- Máximo 1 filter-bar por pantalla
- No puede coexistir con tab-bar en la misma posición vertical
- Cuando multi_select: false, seleccionar un filtro deselecciona el anterior automáticamente
- Siempre debe haber un filtro "Todos" o equivalente como primera opción

## Node ID en Figma
1:24

## Tokens asociados
- background: color-surface-primary
- chip-default: color-surface-secondary, color-text-secondary
- chip-selected: color-action-primary, color-text-on-primary
- border-bottom: color-border-subtle
- height: size-filter-bar (48px)
