# empty-state

## Descripción
Estado vacío de una pantalla o sección. Se muestra cuando no hay datos que mostrar. Siempre incluye una ilustración, título, descripción y una acción para salir del estado vacío. Nunca debe ser solo informativo.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:31` | 358×236px | Estado vacío de cualquier listado o sección |

---

## Estructura visual
```
358px · 236px altura
┌──────────────────────────────────────────────┐
│ padding 24px en todos los lados              │
│                                              │
│          [illustration 80×80]               │
│                                              │
│      [content: título + descripción]        │
│                                              │
│           [action "Limpiar filtros"]        │
│                                              │
└──────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF`
- Layout: VERTICAL · padding: 24px todos · gap: 16px
- Ilustración: elipse 80×80 (placeholder — sustituir por ilustración real)
- Action: DM Sans Regular 12px · color brand `rgb(79,70,229)`

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | — | Sí |
| `description` | TEXT | — | Sí |
| `action` | TEXT | `"Limpiar filtros"` | Sí |
| `illustration` | — | Elipse gris | Sustituir por ilustración contextual |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | VERTICAL |
| padding | 24px todos los lados |
| gap | 16px → `Spacing/Gap/XL` |
| width | 358px |
| height | 236px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Título | `Text/Default/Default` | `rgb(15,23,42)` |
| Descripción | `Text/Neutral/Default` | `rgb(71,85,105)` |
| Action | `Text/Brand/Default` | `rgb(79,70,229)` |
| Gap | `Spacing/Gap/XL` | `16px` |
| Padding | `Spacing/Padding/Horizontal/LG` | `24px` |

---

## Cuándo usarlo
- Cuando un listado no tiene items que mostrar
- Cuando el usuario no tiene productos, movimientos o fondos
- Cuando una búsqueda no devuelve resultados

## Cuándo NO usarlo
- En la misma pantalla que `card-item` (mutuamente excluyentes)
- Sin CTA — el empty-state siempre tiene una acción para salir
- Como estado de carga — usar `skeleton-loader`
- Como estado de error — usar `notification-banner` con variante error

---

## Restricciones
- **Mutuamente excluyente con `card-item`** en la misma pantalla
- El texto de `action` SIEMPRE orientado a la acción con tono positivo
- Nunca usar "No tienes nada aquí" — usar "Aún no tienes X — ¿Empezamos?"
- La ilustración debe ser contextual al tipo de contenido vacío

---

## Uso en patrones

| Patrón | Cuándo aparece | Sustituye a |
|---|---|---|
| `lista-con-filtros` | Sin resultados de filtro | `card-item` |
| `error-estado` | Error de red o acceso denegado | Pantalla completa |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| "No tienes fondos" sin CTA | Tono negativo y sin acción | "Aún no tienes fondos — Empieza con 50€" + CTA |
| empty-state + card-item juntos | Violación de exclusividad | Solo uno según si hay datos |
| Ilustración genérica en todos los contextos | Sin contextualización | Ilustración específica por tipo de contenido |