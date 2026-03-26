# card-item/financial

## Node ID en Figma
137:1758

## Descripción
Variante financiera del card-item. Muestra un activo, posición o movimiento con importe destacado, variación y color semántico (positivo/negativo). Se usa en dashboards, carteras y listados de inversión.

## Metadata
figma_id: 137:1758

## Cuándo usar
- Listados de fondos, acciones o ETFs con precio y variación
- Resumen de posiciones en cartera
- Movimientos con importe y signo

## Cuándo NO usar
- Items genéricos sin dato financiero — usar card-item estándar
- Items con imagen — usar card-media

## Propiedades
| Propiedad | Tipo | Valores | Default |
|---|---|---|---|
| title | string | — | "Fondo Indexado Global" |
| subtitle | string | — | "Renta variable" |
| value | string | — | "1.250,00 €" |
| variation | string | — | "+2,34%" |
| trend | enum | positive, negative, neutral | positive |
| show_chevron | boolean | true, false | false |

## Restricciones
- trend:positive → color verde en variation
- trend:negative → color rojo en variation
- Nunca mostrar variation sin value
