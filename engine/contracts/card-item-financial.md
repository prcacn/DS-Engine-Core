# card-item/financial

## Node ID en Figma
137:1758

## Component Set ID
185:3895

## Descripción
Variante financiera del card-item. Muestra un activo, posición o movimiento con título, subtítulo de categoría, importe destacado y badge de variación con color semántico (positivo/negativo/neutro). Se usa en dashboards, carteras y listados de inversión o transacciones.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `card-item/financial` | `137:1758` | 390×72px | Activo o posición con importe y variación |
| `card-item/financial-expense` | `137:1769` | 390×72px | Gasto o movimiento con valor negativo |

---

## Estructura visual
```
390px · 72px
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [card-content 284×44]              [card-right 74×44]  │
│  title (14px SemiBold)               [value 12px Bold]  │
│  subtitle (12px neutral)             [badge +2,4%]      │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF` — `Background/Default/Default`
- Layout: HORIZONTAL · padding H: 16px · padding V: 14px · gap 16px · radius 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | `Fondo Indexado Global` | Sí |
| `subtitle` | TEXT | `Renta variable` | Sí |
| `value` | TEXT | `1.250,00 €` | Sí |
| `variation` | TEXT | `+2,34%` | Sí |
| `trend` | enum | `positive` | Sí — positive · negative · neutral |
| `show_chevron` | boolean | `false` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 14px → `Spacing/Padding/Vertical/LG` |
| gap | 16px → `Spacing/Gap/XL` |
| borderRadius | 8px → `Spacing/Radius/Component/SM` |
| width | 390px (fill) |
| height | 72px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Título | `Text/Default/Default` | `rgb(15,23,42)` |
| Subtítulo | `Text/Neutral/Default` | `rgb(100,116,139)` |
| Value | `Text/Default/Default` | `rgb(15,23,42)` |
| Badge positivo | `Background/Positive/Subtle` + `Text/Positive/Default` | green/100 + green/700 |
| Badge negativo | `Background/Danger/Subtle` + `Text/Danger/Default` | red/100 + red/700 |
| Badge neutro | `Background/Neutral/Subtle` + `Text/Neutral/Default` | neutral/100 + neutral/700 |
| Padding H | `Spacing/Padding/Horizontal/MD` | `16px` |
| Radio | `Spacing/Radius/Component/SM` | `8px` |

---

## Cuándo usarlo
- Listados de fondos, acciones o ETFs con precio y variación porcentual
- Resumen de posiciones en pantalla de cartera
- Movimientos del historial con importe y signo claro
- Sección de actividad reciente en dashboard

## Cuándo NO usarlo
- Items genéricos sin dato financiero — usar `card-item` estándar
- Items con imagen editorial — usar `card-media`
- Cuando no hay importe que mostrar — usar `card-item` base

---

## Restricciones
- `trend:positive` → badge en verde (`Background/Positive/Subtle`)
- `trend:negative` → badge en rojo (`Background/Danger/Subtle`)
- `trend:neutral` → badge en gris neutro
- Nunca mostrar `variation` sin `value` — van siempre juntos
- Solo en contextos financieros — no usar para contenido genérico
- Mutuamente excluyente con `empty-state` en la misma lista

---

## Uso en patrones

| Patrón | Variante | Repeticiones |
|---|---|---|
| `lista-con-filtros` | `card-item/financial` | N (dinámico) |
| `dashboard` | `card-item/financial` | ×3-5 |
| `detalle` | `card-item/financial` | ×1 (activo principal) |
| `movements-set` | `card-item/financial-expense` | N (por grupo de fecha) |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Badge verde con valor negativo | `trend` incorrecto | Usar `trend:negative` para bajadas — siempre semántico |
| card-item/financial para datos no financieros | Variante incorrecta | Usar `card-item` base para contenido sin importe |
| Variation sin value | Dato incompleto | Los dos campos son inseparables |
| Gap entre cards consecutivos | Espaciado incorrecto | Gap 0 entre items de un mismo listado |
