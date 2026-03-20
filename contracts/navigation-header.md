# navigation-header

## Descripción
Barra de navegación superior. Elemento fijo en la parte alta de cada pantalla. Comunica al usuario dónde está, le permite volver atrás o cerrar, y da acceso a acciones contextuales. Existe en 3 variantes — cada una obligatoria según el nivel de navegación.

---

## Variantes

| Variante Figma | Node ID | Nivel | Cuándo usar |
|---|---|---|---|
| `Type=Predeterminada` | `112:1853` | L1 | Secciones accesibles desde tab-bar |
| `Type=Dashboard` | `170:2660` | L0 | Pantalla raíz — home / inicio |
| `Type=Modal` | `170:2843` | L2 / L3 | Detalle, formulario, confirmación |

**Node ID del COMPONENT_SET completo:** `170:2653`  
**Variante por defecto:** `Type=Predeterminada`

---

## Estructura visual por variante

### Type=Predeterminada — L1
```
390px · 56px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [li:align-justify 24×24]  [title 34×21]  [li:bell 24×24]│
└─────────────────────────────────────────────────────────┘
```
- Icono izquierda: `li:align-justify` (menú hamburguesa)
- Centro: texto `title` — DM Sans SemiBold 16px
- Icono derecha: `li:bell` (notificaciones)
- Color title: `Text/Default/Default` → `rgb(15,23,42)`
- Fondo: `Background/Default/Default` → `#FFFFFF`

### Type=Dashboard — L0
```
390px · 56px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [li:align-justify 24×24]              [li:bell 24×24]  │
└─────────────────────────────────────────────────────────┘
```
- Icono izquierda: `li:align-justify` (menú hamburguesa)
- Sin campo title — el título aparece en el body de la pantalla
- Icono derecha: `li:bell` (notificaciones)
- Fondo: `Background/Default/Default` → `#FFFFFF`

### Type=Modal — L2 / L3
```
390px · 56px altura
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [title 34×21]                          [li:x 24×24]   │
└─────────────────────────────────────────────────────────┘
```
- Sin icono izquierda
- Centro-izquierda: texto `title` — DM Sans SemiBold 16px
- Icono derecha: `li:x` (cerrar)
- Color title: `Text/Default/Default` → `rgb(15,23,42)`
- Fondo: `Background/Default/Default` → `#FFFFFF`
- **Nota L2:** en instancias de pantallas de detalle se añade `li:arrow-left` a la izquierda
- **Nota L3:** sin icono izquierdo, solo ✕ cerrar a la derecha

---

## Propiedades del componente

| Propiedad | Tipo | Valores | Default | Editable |
|---|---|---|---|---|
| `Type` | VARIANT | `Predeterminada`, `Dashboard`, `Modal` | `Predeterminada` | Sí |
| `Title` | TEXT | Cualquier string | `"Title"` | Sí |

**ID de propiedad en Figma API:** `Title#170:0` / `Type`

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingRight | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop | 0px |
| paddingBottom | 0px |
| itemSpacing (gap) | 8px → `Spacing/Gap/MD` |
| width | 390px (fill container) |
| height | 56px (fijo en todas las variantes) |

---

## Tokens aplicados

| Elemento | Token semántico | Valor resuelto |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` / `#0F172A` dark |
| Color title | `Text/Default/Default` — `VariableID:22:491` | `rgb(15,23,42)` |
| Fuente title | DM Sans SemiBold 16px | `typography/heading` |
| Padding H | `Spacing/Padding/Horizontal/MD` | `16px` |
| Gap | `Spacing/Gap/MD` | `8px` |
| Iconos | `Icon/Default/Default` | `rgb(15,23,42)` |

---

## Cuándo usar cada variante

| Variante | Usar cuando | NO usar cuando |
|---|---|---|
| `Type=Dashboard` | Pantalla L0 — único punto de entrada | En cualquier otra pantalla |
| `Type=Predeterminada` | Sección L1 con título y campana | En pantallas de detalle o confirmación |
| `Type=Modal` | Pantalla L2/L3 — detalle, form, confirmación | En pantallas raíz o secciones con tab-bar |

---

## Cuándo NO usar este componente
- En `modal-bottom-sheet` — tiene su propio header interno
- En onboarding con flujo lineal sin posibilidad de escape (usar header custom)

---

## Restricciones

- **Singleton** — solo puede haber uno por pantalla
- Siempre es el **primer elemento** de la pantalla (order: 0, top: 0)
- `Type=Dashboard` nunca lleva texto `title` en el header
- `Type=Modal` nunca lleva `li:align-justify` ni `li:bell`
- El texto `title` no debe superar **32 caracteres**
- No combinar con `tab-bar` en L2/L3

---

## Nivel de navegación → Variante obligatoria

| Nivel | Variante | Icono izquierda | Icono derecha |
|---|---|---|---|
| L0 | `Type=Dashboard` | `li:align-justify` | `li:bell` |
| L1 | `Type=Predeterminada` | `li:align-justify` | `li:bell` |
| L2 | `Type=Modal` | `li:arrow-left` (en instancia) | `li:x` |
| L3 | `Type=Modal` | — (vacío) | `li:x` |

---

## Uso en patrones

| Patrón | Variante | Motivo |
|---|---|---|
| `dashboard` | `Type=Dashboard` | L0 — sin título |
| `lista-con-filtros` | `Type=Predeterminada` | L1 — con título y campana |
| `formulario-simple` | `Type=Modal` | L2 — con arrow-left |
| `detalle` | `Type=Modal` | L2 — con arrow-left |
| `confirmacion` | `Type=Modal` | L3 — solo ✕ cerrar |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Header sin título en L1 | Usar `Type=Dashboard` en vez de `Type=Predeterminada` | Cambiar a `Type=Predeterminada` y rellenar `title` |
| Botón de volver en L0 | Usar `Type=Modal` en el home | Cambiar a `Type=Dashboard` |
| Dos navigation-header en pantalla | Composición incorrecta | Eliminar el duplicado — regla de singleton |
| title con más de 32 chars | Texto demasiado largo | Acortar o usar subtítulo en el body |
