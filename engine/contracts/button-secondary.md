# button-secondary

## Node ID en Figma
185:3894

## Descripción
Botón de acción secundaria. Representa una alternativa a la acción principal — normalmente "cancelar", "volver" o una acción de menor peso. Siempre aparece junto a un `button-primary`, nunca solo.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:11` | 83×48px (base) — se estira al ancho disponible | Acción alternativa o cancelación |

---

## Estructura visual
```
┌──────────────────────────────────────┐
│ ←16px  [label "Cancelar"]   16px→   │  48px altura · radius 8px · borde brand
└──────────────────────────────────────┘
```
- Fondo: `#FFFFFF` — `Background/Default/Default`
- Label: DM Sans Regular 12px · color `rgb(79,70,229)` — `Text/Brand/Default`
- Layout: HORIZONTAL · padding H: 16px · padding V: 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `label` | TEXT | `"Cancelar"` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 8px → `Spacing/Padding/Vertical/MD` |
| gap | 0px |
| borderRadius | 8px → `Spacing/Radius/Component/SM` |
| width | fill container |
| height | 48px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Label | `Text/Brand/Default` | `rgb(79,70,229)` |
| Fuente | DM Sans Regular 12px | `typography/label` |
| Borde | `Border/Brand/Default` | `rgb(79,70,229)` |

---

## Cuándo usarlo
- Como alternativa al `button-primary` en pantallas de confirmación (L3)
- Para cancelar un flujo o volver al paso anterior
- En formularios con opción de "Limpiar" o "Descartar"

## Cuándo NO usarlo
- Como único botón de la pantalla — siempre acompañando a `button-primary`
- Para acciones destructivas sin confirmación

---

## Restricciones
- Siempre va **debajo** del `button-primary`, nunca encima
- El label SIEMPRE descriptivo: "Cancelar transferencia", nunca solo "Cancelar"
- No usar como primer CTA de un flujo

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `confirmacion` | Segundo botón en Actions zone, debajo del primary | Cancelar la acción |
| `formulario-simple` | Opcional, bajo el primary | Limpiar o descartar |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Button-secondary solo en pantalla | Sin button-primary | Añadir button-primary o reconsiderar el flujo |
| Encima del button-primary | Orden incorrecto | Siempre: primary arriba, secondary abajo |