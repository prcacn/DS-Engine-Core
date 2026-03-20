# filter-bar

## Node ID en Figma
1:24

## Component Set ID
185:3897  ← COMPONENT_SET padre (no instanciar directamente)

## Descripción
Barra de filtros con chips seleccionables. Permite al usuario filtrar el contenido de una lista sin abandonar la pantalla. Siempre va justo debajo del `navigation-header`.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:24` | 230×48px (base) — se estira a 390px en pantalla | Filtros de categoría en listados |

---

## Estructura visual
```
390px · 48px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [chip-active 47×23]  [chip 68×23]  [chip 67×23]  ...  │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF` — `Background/Default/Default`
- Chip activo: fondo brand · texto blanco
- Chip inactivo: fondo neutral · texto neutral
- Layout: HORIZONTAL · padding H: 16px · padding V: 8px · gap: 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| chips | Contenido interno | 3 chips (1 activo, 2 inactivos) | Sí (añadir/quitar chips) |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 8px → `Spacing/Padding/Vertical/MD` |
| gap | 8px → `Spacing/Gap/MD` |
| width | 390px (fill) |
| height | 48px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Chip activo fondo | `Background/Brand/Default` | `rgb(79,70,229)` |
| Chip activo texto | `Text/Default/nochange` | `#FFFFFF` |
| Chip inactivo fondo | `Background/Neutral/Default` | neutral/300 |
| Chip inactivo texto | `Text/Neutral/Default` | neutral/700 |
| Gap | `Spacing/Gap/MD` | `8px` |

---

## Cuándo usarlo
- En listados L1 con categorías filtrables
- Inmediatamente debajo del `navigation-header`
- Cuando hay entre 2 y 6 categorías de filtrado

## Cuándo NO usarlo
- En pantallas L2/L3 (detalle o confirmación)
- En formularios — no es un elemento de input
- Cuando hay más de 6 filtros (usar modal de filtros)
- En pantallas L0 (dashboard) — los filtros pertenecen a secciones, no al home

---

## Restricciones
- **Máximo 1 por pantalla**
- Siempre va inmediatamente debajo del `navigation-header` (order: 1)
- Siempre hay un chip activo por defecto ("Todos" o el primero)
- No combinar con `formulario-simple` en la misma pantalla

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `lista-con-filtros` | Order 1, bajo navigation-header | Filtro por categoría |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| filter-bar en pantalla de detalle | Variante de patrón incorrecta | filter-bar solo en L1 |
| Ningún chip activo | Estado inicial incorrecto | "Todos" siempre activo por defecto |
| Más de 6 chips | Demasiadas categorías | Usar modal de filtros avanzados |