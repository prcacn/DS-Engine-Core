# chart-sparkline

## Node ID en Figma
137:1746

## Descripción
Gráfico sparkline de evolución temporal. Muestra la tendencia de un valor (saldo, posición, activo) como línea compacta sin ejes ni etiquetas. Siempre acompaña a amount-display en el dashboard.

## Metadata
figma_id: 137:1746

## Cuándo usarlo
- Evolución del saldo en el dashboard tras amount-display
- Tendencia de un activo en pantalla de detalle
- Resumen visual de rendimiento en cartera

## Cuándo NO usarlo
- Datos sin contexto temporal
- Cuando se necesitan ejes o valores exactos — usar un gráfico completo
- En pantallas de formulario o confirmación

## Propiedades
| Propiedad | Tipo | Valores | Default |
|---|---|---|---|
| trend | enum | positive, negative, neutral | positive |

## Restricciones
- Siempre aparece después de amount-display, nunca solo
- Solo uno por pantalla en contexto dashboard
- trend:positive → línea verde ascendente
- trend:negative → línea roja descendente
