# chart-sparkline

## Descripción
Gráfica de evolución compacta. Muestra la tendencia de un valor a lo largo del tiempo de forma visual y resumida. Complementa al `amount-display` en pantallas de detalle financiero.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `137:1746` | 390×80px | Evolución temporal de un activo |

---

## Layout

| Propiedad | Valor |
|---|---|
| width | 390px (fill) |
| height | 80px |

---

## Cuándo usarlo
- En detalles de producto financiero tras el `amount-display`
- En dashboards cuando la evolución de cartera es relevante
- Para mostrar tendencia de los últimos 12 meses

## Cuándo NO usarlo
- Sin `amount-display` en la misma pantalla
- En listados — usar `badge` para indicar tendencia de forma compacta
- En pantallas de formulario

---

## Restricciones
- Siempre va **después del `amount-display`**, nunca antes
- Los datos del gráfico deben estar actualizados — nunca mostrar datos estáticos como si fueran en tiempo real
- Incluir eje de tiempo legible (meses/semanas)

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `detalle` | Order 2, tras amount-display | Evolución del fondo |
| `dashboard` | Opcional, tras amount-display | Evolución de cartera |