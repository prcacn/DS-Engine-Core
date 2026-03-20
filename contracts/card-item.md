# card-item

## Descripción
Fila de lista genérica. Elemento repetible para mostrar items en listados. Contiene título, subtítulo y zona derecha para valor o acción. Base para todas las variantes de card.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `card-item` | `1:13` | 390×72px | Lista genérica |
| `card-item/financial` | `137:1758` | 390×72px | Item financiero con valor y variabilidad |
| `card-item/financial-expense` | `137:1769` | 390×72px | Item de gasto con valor negativo |

---

## Estructura visual
```
390px · 72px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [card-content 284×44]              [card-right 58×16]  │
│  título / subtítulo                       valor / acción │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF` — `Background/Default/Default`
- Layout: HORIZONTAL · padding H: 16px · padding V: 12px · gap: 16px · radius: 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | — | Sí |
| `subtitle` | TEXT | — | Sí |
| `value` | TEXT | — | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 12px → `Spacing/Padding/Vertical/LG` |
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
| Padding H | `Spacing/Padding/Horizontal/MD` | `16px` |
| Gap | `Spacing/Gap/XL` | `16px` |
| Radio | `Spacing/Radius/Component/SM` | `8px` |

---

## Cuándo usarlo
- En listados de secciones L1 (fondos, transacciones, contactos)
- Como ítem repetible en patrones `lista-con-filtros` y `detalle`
- Usar `card-item/financial` para datos con valor monetario y variación

## Cuándo NO usarlo
- Cuando no hay datos — usar `empty-state`
- En la misma pantalla que `empty-state` (mutuamente excluyentes)
- En `modal-bottom-sheet` — usar layout propio del modal

---

## Restricciones
- **Mutuamente excluyente con `empty-state`** — no pueden coexistir en la misma pantalla
- Repetible sin límite máximo definido — usar paginación si >20 items
- Sin margen entre items consecutivos (gap: 0 entre cards)
- `card-item/financial` solo en contextos financieros (dominio: inversiones, cuentas, movimientos)

---

## Uso en patrones

| Patrón | Variante | Repeticiones |
|---|---|---|
| `lista-con-filtros` | `card-item` o `card-item/financial` | N (dinámico) |
| `detalle` | `card-item` | 3-4 (datos del item) |
| `dashboard` | `card-item/financial` | ×3 |
| `confirmacion` | `card-item` | 3-4 (resumen operación) |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| card-item + empty-state juntos | Violación de exclusividad | Solo uno según si hay datos |
| card-item genérico para datos financieros | Variante incorrecta | Usar `card-item/financial` |
| Gap entre cards | Espaciado incorrecto | Gap 0 entre items consecutivos |