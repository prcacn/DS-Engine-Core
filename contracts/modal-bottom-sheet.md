# modal-bottom-sheet

## Descripción
Hoja inferior modal. Aparece desde la parte inferior de la pantalla para mostrar contenido contextual, confirmaciones o acciones adicionales sin salir de la pantalla actual. Bloquea la interacción con el fondo mientras está abierto.

## Propiedades
| Propiedad     | Tipo     | Valores posibles             | Valor por defecto |
|---------------|----------|------------------------------|-------------------|
| title         | string   | Cualquier texto              | ""                |
| variant       | enum     | default, confirmation, menu  | default           |
| height        | enum     | auto, half, full             | auto              |
| show_handle   | boolean  | true, false                  | true              |
| show_close    | boolean  | true, false                  | true              |
| backdrop_close| boolean  | true, false                  | true              |

## Cuándo usarlo
- Para confirmaciones de acciones importantes sin redirigir a otra pantalla
- Para mostrar opciones contextuales de un item (menú de acciones)
- Para formularios cortos que no justifican una pantalla completa (máx. 3 campos)
- Para información adicional de un elemento sin perder el contexto del listado

## Cuándo NO usarlo
- Para flujos de más de 2 pasos (usa una pantalla nueva)
- Para formularios largos (más de 3 campos)
- Para contenido que el usuario necesita comparar con la pantalla de fondo
- Anidado dentro de otro modal-bottom-sheet

## Restricciones
- Máximo 1 abierto al mismo tiempo
- No anidar modales
- Si variant: confirmation siempre debe tener button-primary y button-secondary
- Con height: full se comporta como pantalla completa y debe tener navigation-header interno
- El backdrop siempre oscurece el fondo — nunca transparente

## Node ID en Figma
1:36

## Tokens asociados
- background: color-surface-primary
- backdrop: color-overlay (rgba negro 40%)
- handle: color-border-default
- radius-top: radius-modal
- shadow: shadow-modal
