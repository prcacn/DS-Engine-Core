# navigation-header

## Descripción
Barra de navegación superior. Elemento fijo en la parte alta de cada pantalla. Comunica al usuario dónde está y le permite volver atrás o acceder a acciones contextuales. Existe en 3 variantes según el nivel de navegación en el que aparece.

## Variantes

| Variante | Node ID | Nivel | Estructura | Altura |
|----------|---------|-------|-----------|--------|
| `Type=Dashboard` | `170:2660` | L0 | Menú ← → → Campana (sin título) | 56px |
| `Type=Predeterminada` | `112:1853` | L1 | Menú ← → Título → Campana | 56px |
| `Type=Modal` | `170:2843` | L2 / L3 | Título → ✕ Cerrar | 56px |

## Estructura interna por variante

### Type=Dashboard (L0)
```
┌─────────────────────────────────────────────────────────┐
│ padding 16px                              padding 16px  │
│  [li:align-justify]                    [li:bell]        │
│  icono menú (24×24)               icono campana (24×24) │
└─────────────────────────────────────────────────────────┘
```
- Layout: HORIZONTAL · gap: 8px · padding H: 16px
- Sin campo `title` — el título aparece en el cuerpo de la pantalla
- Uso: solo en pantalla L0 (dashboard/home)

### Type=Predeterminada (L1)
```
┌─────────────────────────────────────────────────────────┐
│ padding 16px                              padding 16px  │
│  [li:align-justify]   [title]          [li:bell]        │
│  icono menú (24×24)   "Title"     campana (24×24)       │
└─────────────────────────────────────────────────────────┘
```
- Layout: HORIZONTAL · gap: 8px · padding H: 16px
- Campo `title`: texto, color `rgb(15,23,42)` — neutral/1000
- Uso: pantallas L1 (secciones principales accesibles desde tab-bar)

### Type=Modal (L2 / L3)
```
┌─────────────────────────────────────────────────────────┐
│ padding 16px                              padding 16px  │
│  [title]                               [li:x]           │
│  "Title"                          icono cerrar (24×24)  │
└─────────────────────────────────────────────────────────┘
```
- Layout: HORIZONTAL · gap: 8px · padding H: 16px
- Campo `title`: texto, color `rgb(15,23,42)` — neutral/1000
- Icono derecho: `li:x` (cerrar/descartar) en lugar de campana
- Uso: pantallas L2 (detalle/acción) y L3 (confirmación/resultado)
- **Nota:** en L2 el icono izquierdo es `← arrow-left` (instancias del frame usan esta variante con back)

## Propiedades

| Propiedad | Tipo | Valores posibles | Default |
|-----------|------|-----------------|---------|
| `Type` | enum | `Dashboard`, `Predeterminada`, `Modal` | `Predeterminada` |
| `title` | string | Cualquier texto (máx. 32 chars) | `"Title"` |
| `show_action` | boolean | true, false | false |

## Cuándo usar cada variante

| Variante | Cuándo |
|----------|--------|
| `Dashboard` | Solo en L0 — pantalla raíz sin título en el header |
| `Predeterminada` | En L1 — secciones con título y campana de notificaciones |
| `Modal` | En L2 y L3 — pantallas de detalle, formularios, confirmaciones |

## Cuándo NO usarlo
- En modales de tipo `modal-bottom-sheet` — tienen su propio header interno
- En pantallas de onboarding con flujo lineal sin posibilidad de escape

## Restricciones
- Siempre es el primer elemento visible de la pantalla (order: 0)
- Solo puede haber **uno** por pantalla
- El `title` no debe superar 32 caracteres
- `Type=Dashboard` nunca lleva título en el header
- `Type=Modal` nunca lleva icono de menú ni campana

## Nivel de navegación → Variante

| Nivel | Variante obligatoria |
|-------|---------------------|
| L0 | `Type=Dashboard` |
| L1 | `Type=Predeterminada` |
| L2 | `Type=Modal` (con arrow-left en icono izquierdo) |
| L3 | `Type=Modal` (sin icono izquierdo, solo ✕ cerrar) |

## Node ID en Figma
170:2653 (COMPONENT_SET completo)

Variantes individuales:
- `Type=Dashboard`: `170:2660`
- `Type=Predeterminada`: `112:1853`
- `Type=Modal`: `170:2843`

## Tokens asociados
- background: `color/background/default/default` — `#FFFFFF`
- title: `color/text/default/default` — `rgb(15,23,42)`
- icon: `color/icon/default/default`
- height: `56px` (todas las variantes)
- padding horizontal: `Spacing/Padding/Horizontal/MD` — `16px`
- gap: `Spacing/Gap/MD` — `8px`
