# amount-display

## Node ID en Figma
179:3469

## Descripción
Componente de visualización de saldo o importe principal. Muestra una etiqueta superior, el importe destacado con símbolo de moneda y una sublabel con variación o contexto adicional. Se usa en dashboards como elemento hero de saldo global.

## Metadata
figma_id: 179:3469

## Cuándo usarlo
- Saldo total disponible en el dashboard (elemento hero)
- Importe principal de una posición de cartera
- Resumen de saldo en pantalla de inicio

## Cuándo NO usarlo
- Importes dentro de listas — usar card-item/financial
- Múltiples importes en paralelo — usar card-accounts
- Importes secundarios — usar texto simple

## Propiedades
| Propiedad | Tipo | Valores | Default |
|---|---|---|---|
| label | string | — | "Saldo disponible" |
| currency | string | — | "€" |
| amount | string | — | "14.123,00" |
| sublabel | string | — | "+€120,00 este mes" |

## Restricciones
- Solo un amount-display por pantalla (singleton)
- Siempre acompañado de label descriptiva
- sublabel debe indicar variación o contexto temporal
- No usar sin currency visible
