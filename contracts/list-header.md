# list-header

## Node ID en Figma
20:797

## Descripción
Cabecera de sección dentro de un listado. Separa grupos de contenido con un título y una acción secundaria ("Ver todo"). Siempre precede a un grupo de `card-item`.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `20:797` | 390×44px | Separador de sección con título y acción |

---

## Estructura visual
```
390px · 44px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [Sección]                              [Ver todo]      │
│  12px DM Sans · neutral/1000            12px · brand    │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `rgb(241,245,249)` — `Background/Neutral/Secondary` (neutral/300)
- Layout: HORIZONTAL · padding H: 16px · padding V: 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | `"Sección"` | Sí |
| `action_label` | TEXT | `"Ver todo"` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 8px → `Spacing/Padding/Vertical/MD` |
| gap | 0px (title flex-grow, action al final) |
| width | 390px |
| height | 44px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Neutral/Secondary` | `rgb(241,245,249)` |
| Título | `Text/Default/Default` 12px Regular | `rgb(15,23,42)` |
| Acción | `Text/Brand/Default` 12px Regular | `rgb(79,70,229)` |

---

## Cuándo usarlo
- Para separar grupos de `card-item` en un listado
- En dashboards para titular bloques de contenido
- Cuando hay más items de los que se muestran y se necesita "Ver todo"

## Cuándo NO usarlo
- Sin ir seguido de al menos un `card-item`
- En formularios
- En pantallas L3 (confirmación)

---

## Restricciones
- Siempre va **inmediatamente antes** de su grupo de `card-item`
- Gap 0 entre `list-header` y el primer `card-item` siguiente
- El `title` describe el grupo: "Últimos movimientos", "Tus fondos"
- La acción "Ver todo" siempre lleva a una pantalla L1 con el listado completo

---

## Uso en patrones

| Patrón | Título ejemplo | Acción |
|---|---|---|
| `dashboard` | "Últimos movimientos" | "Ver todo" → L1 |
| `detalle` | "Información del producto" | Opcional |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| list-header sin cards debajo | Estructura incompleta | Siempre seguido de card-items |
| Gap entre list-header y card | Espaciado incorrecto | Gap 0 entre header y primer card |