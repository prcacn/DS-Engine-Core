# empty-state

## Descripción
Estado vacío. Se muestra cuando un listado no tiene contenido que mostrar, ya sea porque no hay datos, porque los filtros no devuelven resultados, o porque el usuario aún no ha creado contenido. Siempre incluye una explicación y una acción de salida.

## Propiedades
| Propiedad    | Tipo     | Valores posibles                              | Valor por defecto   |
|--------------|----------|-----------------------------------------------|---------------------|
| illustration | enum     | no-results, no-data, no-connection, no-access | no-results          |
| title        | string   | Cualquier texto                               | "Sin resultados"    |
| description  | string   | Cualquier texto                               | ""                  |
| show_action  | boolean  | true, false                                   | true                |
| action_label | string   | Cualquier texto                               | "Limpiar filtros"   |

## Cuándo usarlo
- Siempre que un listado tenga 0 items — nunca dejar un listado vacío sin feedback
- Cuando un filtro activo no devuelve resultados
- Cuando el usuario no ha creado contenido todavía (onboarding)
- Cuando hay un error de conexión que impide cargar datos

## Cuándo NO usarlo
- En pantallas de formulario (los formularios vacíos son el estado normal)
- Como pantalla de error genérica — usa una pantalla de error específica
- Cuando hay contenido pero está cargando — usa un skeleton loader

## Restricciones
- Siempre centrado verticalmente en el espacio disponible del listado
- Nunca junto a card-item en la misma lista — son mutuamente excluyentes
- Si show_action: true, el action_label debe ser específico y resolver el problema
- No usar más de 1 empty-state por pantalla

## Node ID en Figma
1:31

## Tokens asociados
- illustration: color-illustration-primary (neutrales)
- title: color-text-primary, size-text-lg, weight-semibold
- description: color-text-secondary, size-text-md
- action: color-action-primary (link style)
