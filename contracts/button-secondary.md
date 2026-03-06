# button-secondary

## Descripción
Botón de acción secundaria. Complementa al button-primary ofreciendo una alternativa menos prioritaria. Visualmente menos prominente pero igualmente accesible.

## Propiedades
| Propiedad  | Tipo     | Valores posibles              | Valor por defecto |
|------------|----------|-------------------------------|-------------------|
| label      | string   | Cualquier texto               | "Cancelar"        |
| state      | enum     | default, loading, disabled    | default           |
| size       | enum     | small, medium, large          | medium            |
| full_width | boolean  | true, false                   | false             |
| variant    | enum     | outlined, ghost               | outlined          |

## Cuándo usarlo
- Para ofrecer una alternativa a la acción principal: Cancelar, Volver, Omitir
- En parejas con button-primary cuando el usuario tiene dos opciones claras
- Para acciones que deshacen o cancelan un flujo
- En pantallas de confirmación junto al button-primary

## Cuándo NO usarlo
- Como acción única en una pantalla (si es la única acción, usa button-primary)
- Para acciones destructivas (usa button-danger)
- Más de 2 button-secondary en la misma pantalla

## Restricciones
- Máximo 2 por pantalla visible
- Siempre menos prominente visualmente que el button-primary si ambos coexisten
- En parejas con button-primary, el secondary va siempre a la izquierda o arriba
- No usar variant: ghost en fondos oscuros

## Node ID en Figma
pending

## Tokens asociados
- border: color-action-primary
- text: color-action-primary
- background: transparent
- radius: radius-button
- height: size-button-medium (48px)
