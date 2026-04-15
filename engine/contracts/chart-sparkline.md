# chart-sparkline

## Node ID en Figma
137:1746

## Descripción
Gráfico sparkline de evolución temporal. Muestra la tendencia de un valor (saldo, posición o activo) como una línea compacta sin ejes ni etiquetas. Siempre acompaña a `amount-display` como soporte visual de la variación que ya muestra el número.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `trend=positive` | `137:1746` | 390×80px | Línea ascendente en verde |
| `trend=negative` | `137:1747` | 390×80px | Línea descendente en rojo |
| `trend=neutral` | `137:1748` | 390×80px | Línea plana en gris neutro |

---

## Estructura visual
```
390px · 80px
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   ╱╲        ╱╲    ╱╲                                   │  línea continua
│  ╱  ╲______╱  ╲__╱  ╲____╱                             │  sin ejes
│                                                         │
└─────────────────────────────────────────────────────────┘
```
- Fondo: transparente (hereda del contenedor)
- Línea positiva: `rgb(22,163,74)` — `Text/Positive/Default` (green/700)
- Línea negativa: `rgb(220,38,38)` — `Text/Danger/Default` (red/700)
- Línea neutra: `rgb(148,163,184)` — `Text/Neutral/Default` (neutral/400)
- Sin padding · sin ejes · sin labels de datos

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `trend` | enum | `positive` | Sí — positive · negative · neutral |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| padding | 0px (sin margen) |
| width | 390px (fill container) |
| height | 80px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Línea positiva | `Text/Positive/Default` | `rgb(22,163,74)` — green/700 |
| Línea negativa | `Text/Danger/Default` | `rgb(220,38,38)` — red/700 |
| Línea neutra | `Text/Neutral/Default` | neutral/400 |
| Fondo | transparente | hereda del contenedor |

---

## Cuándo usarlo
- Evolución del saldo en el dashboard, siempre inmediatamente después de `amount-display`
- Tendencia de un activo o posición en pantalla de detalle financiero
- Resumen visual de rendimiento en vista de cartera

## Cuándo NO usarlo
- Datos sin contexto temporal (no hay serie de tiempo)
- Cuando se necesitan ejes, valores exactos o rangos — usar un gráfico completo
- Sin `amount-display` acompañando — el sparkline no tiene sentido solo
- En pantallas de formulario, confirmación o error

---

## Restricciones
- **Siempre aparece inmediatamente después de `amount-display`** — nunca solo
- Solo uno por pantalla en el mismo contexto visual
- El `trend` del sparkline debe coincidir con el signo de la variación en `amount-display`
- Línea positiva → ascendente · negativa → descendente · neutra → plana
- Sin interactividad — es puramente visual, no un gráfico de análisis

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `dashboard` | Tras `amount-display` | Muestra tendencia del saldo global |
| `detalle` | Tras valor principal del activo | Tendencia del activo visualizado |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Sparkline positivo con variación negativa en amount-display | `trend` inconsistente con el dato | `trend` debe coincidir con el signo real de la variación |
| Sparkline sin amount-display | Uso incorrecto en solitario | Siempre ir acompañado de `amount-display` |
| Más de un sparkline en el mismo bloque | Ruido visual | Un solo sparkline por contexto visual |
