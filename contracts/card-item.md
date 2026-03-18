# card-item

## Descripción
Tarjeta de item para listas. Unidad básica de información en cualquier listado. Representa un elemento individual con su información más relevante y permite interacción para ver el detalle.

## Propiedades
| Propiedad      | Tipo     | Valores posibles               | Valor por defecto |
|----------------|----------|--------------------------------|-------------------|
| title          | string   | Cualquier texto                | ""                |
| subtitle       | string   | Cualquier texto                | ""                |
| value          | string   | Cualquier texto                | ""                |
| badge          | string   | Cualquier texto corto          | ""                |
| badge_color    | enum     | neutral, positive, negative, warning | neutral    |
| show_chevron   | boolean  | true, false                    | true              |
| show_thumbnail | boolean  | true, false                    | false             |
| state          | enum     | default, selected, disabled    | default           |

## Cuándo usarlo
- En cualquier listado de items navegables: productos, transacciones, fondos, usuarios
- Cuando cada item tiene título, subtítulo y un valor destacado
- Para mostrar colecciones homogéneas donde cada elemento lleva al mismo tipo de detalle
- En resultados de búsqueda

## Cuándo NO usarlo
- Para contenido editorial o artículos (usa un componente de card-content)
- Cuando el item no es navegable ni interactuable
- Para mostrar un único item — en ese caso usa una sección de detalle
- En formularios

## Restricciones
- Siempre dentro de un contenedor de lista (nunca suelto en el layout)
- El title no debe superar 2 líneas
- El value debe ser una sola línea
- No mezclar card-item con show_thumbnail: true y sin thumbnail en el mismo listado

## Node ID en Figma
1:13

## Tokens asociados
- background: color-surface-primary
- title: color-text-primary, size-text-md, weight-medium
- subtitle: color-text-secondary, size-text-sm
- value: color-text-primary, size-text-md, weight-bold
- border-bottom: color-border-subtle
- height: size-card-item (72px mínimo)
