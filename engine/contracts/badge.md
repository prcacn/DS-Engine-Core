# badge

## Node ID en Figma
185:3902

## Component Set ID
185:3902  ← COMPONENT_SET padre (no instanciar directamente)

## Descripción
Etiqueta de estado compacta. Muestra un valor numérico o texto corto con fondo de color semántico. Indica variación, estado o categoría de forma visual y concisa.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `20:800` | 72×26px | Indicador de variación o estado |

---

## Estructura visual
```
72px · 26px · radius 999px (pill)
┌──────────────────────────────┐
│ ←8px  [+2.4%]  8px→         │  2px padding V
└──────────────────────────────┘
```
- Fondo: `rgb(240,253,244)` — `Background/Positive/Subtle` (green/100)
- Texto: `rgb(22,163,74)` — `Text/Positive/Default` (green/700)
- DM Sans Regular 12px
- Layout: HORIZONTAL · padding H: 8px · padding V: 2px · radius: 999px (pill)

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `label` | TEXT | `"+2.4%"` | Sí — valor numérico o texto corto |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 8px → `Spacing/Padding/Horizontal/SM` |
| paddingTop / Bottom | 2px → `Spacing/Padding/Vertical/XS` |
| gap | 0px |
| borderRadius | 999px → `Spacing/Radius/Component/Full` (pill) |
| width | auto (ajusta al contenido) |
| height | 26px |

---

## Tokens aplicados por semántica

| Contexto | Fondo | Texto |
|---|---|---|
| Positivo (subida) | `Background/Positive/Subtle` — green/100 | `Text/Positive/Default` — green/700 |
| Negativo (bajada) | `Background/Danger/Subtle` — red/100 | `Text/Danger/Default` — red/700 |
| Neutro / Info | `Background/Info/Subtle` — sky/100 | `Text/Info/Default` — sky/700 |
| Warning | `Background/Warning/Subtle` — amber/100 | `Text/Warning/Default` — amber/700 |

---

## Cuándo usarlo
- Para mostrar variación porcentual en datos financieros
- Para indicar estado de un item (Cobrado, Pagado, Pendiente)
- Como etiqueta de categoría en listados
- Dentro de `card-item/financial` para la variación del valor

## Cuándo NO usarlo
- Para texto largo (más de 10 caracteres)
- Como botón o elemento interactivo
- Para información principal — es siempre complementario

---

## Restricciones
- Texto máximo 10 caracteres
- Siempre usar el color semántico correcto según el contexto (no decorativo)
- No usar como elemento de navegación

---

## Uso en patrones

| Patrón | Uso | Semántica |
|---|---|---|
| `card-item/financial` | Variación del valor | Verde/rojo según tendencia |
| `lista-con-filtros` | Estado del item | Semántica según estado |
| `detalle` | Nivel de riesgo, categoría | Según contexto |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Badge verde para valor negativo | Color incorrecto | Usar rojo para bajadas |
| Texto largo en badge | Desborda el componente | Máximo 10 chars, abreviar |
| Badge como botón | Uso incorrecto | Usar button-secondary para acciones |