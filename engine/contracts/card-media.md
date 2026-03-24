# card-media

## Node ID en Figma
217:2086

## Component Set ID
217:2086  ← COMPONENT_SET padre (no instanciar directamente)

## Descripción
Tarjeta de contenido con área de imagen/media. Para ítems editoriales, promocionales o de producto que necesitan apoyo visual. Diferencia clave con `card-item`: jerarquía visual (imagen + categoría + título + descripción + acción), no datos navegables de lista.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `layout=vertical` | `218:2087` | 390×290px | Imagen arriba (160px) + cuerpo debajo |
| `layout=horizontal` | `217:2084` | 390×96px | Imagen lateral (96×96) + texto derecha |
| `layout=no-media` | `217:2085` | 390×auto | Solo texto, sin área de imagen |

---

## Estructura visual

### vertical
```
390px
┌────────────────────────────────────────────┐
│         [ media-slot 390×160px ]           │
│              fondo: surface/tertiary        │
├────────────────────────────────────────────┤
│ ←16px                              16px→   │
│  category (11px / medium)                  │  ↑ 12px
│  title (16px / semibold)                   │  4px gap
│  description (14px / regular)              │  4px gap
│  meta ────────────────── action →          │  4px gap
│                                            │  ↓ 16px
└────────────────────────────────────────────┘
```

### horizontal
```
390px
┌──────────┬─────────────────────────────────┐
│  media   │ ←16px                   16px→   │
│ 96×96px  │  category (11px)                │
│ surface/ │  title (16px / semibold)        │
│ tertiary │  meta (11px)                    │
└──────────┴─────────────────────────────────┘
```

### no-media
```
390px
┌────────────────────────────────────────────┐
│ ←16px                              16px→   │
│  category (11px / medium)                  │  ↑ 12px
│  title (16px / semibold)                   │  4px gap
│  description (14px / regular)              │  4px gap
│  meta ────────────────── action →          │  4px gap
│                                            │  ↓ 16px
└────────────────────────────────────────────┘
```

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `layout` | enum | vertical | Sí |
| `media_src` | string | "" | Sí |
| `show_media` | boolean | true | Sí |
| `category` | TEXT | "" | Sí |
| `title` | TEXT | "" | Sí |
| `description` | TEXT | "" | Sí |
| `meta_text` | TEXT | "" | Sí |
| `action_label` | TEXT | "" | Sí |
| `badge` | TEXT | "" | Sí |
| `badge_color` | enum | neutral | Sí |
| `state` | enum | default | Sí |

---

## Layout

### content-slot (body)
| Propiedad | Valor |
|---|---|
| layoutMode | VERTICAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop | 12px → `Spacing/Padding/Vertical/MD` |
| paddingBottom | 16px → `Spacing/Padding/Horizontal/MD` |
| gap (entre items) | 4px → `Spacing/Gap/SM` |

### footer
| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| gap | 8px → `Spacing/Gap/MD` |

### tarjeta
| Propiedad | Valor |
|---|---|
| borderRadius | 12px → `Spacing/Radius/Component/MD` |
| width | 390px (fill) |

---

## Tokens aplicados

### Color
| Elemento | Variable Figma | Token semántico | Valor |
|---|---|---|---|
| Fondo tarjeta | `Background/Default/Default` | `color/surface/primary` | `#FFFFFF` |
| Border tarjeta | `Border/Default/Default` | `color/border/default` | `#E2E8F0` |
| Fondo media-slot | `Background/Default/Tertiary` | `color/surface/tertiary` | `#CBD5E1` |
| Título | `Text/Default/Default` | `color/text/primary` | `#0F172A` |
| Category | `Text/Default/Secondary` | `color/text/secondary` | `#334155` |
| Description | `Text/Default/Secondary` | `color/text/secondary` | `#334155` |
| Meta | `Text/Default/Secondary` | `color/text/secondary` | `#334155` |
| Action label | `Text/Brand/Default` | `color/text/brand` | `#4F46E5` |

### Tipografía
| Elemento | Variable Figma | Valor |
|---|---|---|
| Title size | `Font Size/16` | 16px · DM Sans SemiBold |
| Description size | `Font Size/14` | 14px · DM Sans Regular |
| Category / meta / action | `Font Size/12` | 12px |

### Spacing
| Propiedad | Variable Figma | Token semántico | Valor |
|---|---|---|---|
| padding horizontal | `Spacing/Padding/Horizontal/MD` | `padding/component/md` | 16px |
| padding top | `Spacing/Padding/Vertical/MD` | `padding/vertical/md` | 12px |
| padding bottom | `Spacing/Padding/Horizontal/MD` | `padding/component/md` | 16px |
| gap body | `Spacing/Gap/SM` | `gap/sm` | 4px |
| gap footer | `Spacing/Gap/MD` | `gap/md` | 8px |
| border radius | `Spacing/Radius/Component/MD` | `radius/component/md` | 12px |
| media-slot height | — (valor fijo) | — | 160px (vertical) |
| media-slot width | — (valor fijo) | — | 96px (horizontal) |

---

## Cuándo usarlo
- Artículos, noticias o contenido editorial con imagen de soporte
- Productos o fondos destacados en modo descubrimiento
- Promociones o banners con llamada a la acción clara
- Scrolls horizontales o grids de contenido

## Cuándo NO usarlo
- Listas de transacciones o datos financieros → usar `card-item`
- Un único item sin imagen → usar sección de detalle
- En formularios
- Como sustituto de `empty-state`

---

## Restricciones
- El `title` no debe superar 2 líneas en ninguna variante
- No mezclar variantes `vertical` y `horizontal` en el mismo listado
- `show_media: false` activa automáticamente el layout `no-media`
- El badge se superpone sobre el media-slot (esquina superior izquierda) solo en variante `vertical`
- El `action_label` requiere que `meta_text` también esté presente

---

## Uso en patrones

| Patrón | Variante | Repeticiones |
|---|---|---|
| `lista-con-filtros` | `layout=vertical` o `layout=horizontal` | N (dinámico) |
| `dashboard` | `layout=horizontal` | ×3-5 |
| `detalle` | `layout=vertical` | ×1 (destacado) |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Mezclar card-media y card-item en mismo listado | Componentes distintos | Elegir uno según si el contenido es editorial o datos |
| Usar card-media para transacciones | Componente incorrecto | Usar `card-item/financial` |
| Mezclar variantes vertical y horizontal | Inconsistencia visual | Una sola variante por sección |
