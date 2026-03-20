# tab-bar

## Descripción
Barra de navegación principal por pestañas. Anclada en la parte inferior de la pantalla. Permite al usuario moverse entre las secciones principales de la app. Solo visible en L0 y L1.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `20:784` | 390×56px | Navegación principal en L0 y L1 |

---

## Estructura visual
```
390px · 56px altura
┌─────────────────────────────────────────────────────────┐
│  [tab-Inicio 97×56] [tab-Mercado 97×56] [tab-Cartera 97×56] [tab-Perfil 97×56]
│  icono ● + label    icono + label       icono + label        icono + label
│  (activo: brand)    (inactivo: neutral) (inactivo)           (inactivo)
└─────────────────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF`
- Layout: HORIZONTAL · gap: 4px · sin padding
- 4 tabs de 97px cada uno · VERTICAL interno · gap: 2px
- Tab activo: color brand `rgb(79,70,229)`
- Tab inactivo: color neutral `rgb(100,116,139)` / `rgb(71,85,105)`

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| Tab activo | Estado visual | `tab-Inicio` | Cambiar según sección actual |
| Labels | TEXT | Inicio / Mercado / Cartera / Perfil | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| padding | 0px |
| gap | 4px → `Spacing/Gap/SM` |
| width | 390px |
| height | 56px |
| Cada tab | 97×56px · VERTICAL · gap: 2px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Tab activo | `Text/Brand/Default` + `Icon/Brand/Default` | `rgb(79,70,229)` |
| Tab inactivo | `Text/Neutral/Default` + `Icon/Default/Secondary` | `rgb(100,116,139)` |
| Gap tabs | `Spacing/Gap/SM` | `4px` |

---

## Cuándo usarlo
- En todas las pantallas L0 y L1 — la navegación global siempre visible
- Siempre como último elemento del frame (order final, bottom: 0)

## Cuándo NO usarlo
- En L2 o L3 — el usuario está dentro de un flujo, no navegando entre secciones
- En `modal-bottom-sheet`
- En pantallas de onboarding

---

## Restricciones
- **Singleton** — solo uno por pantalla
- Siempre el **último componente** del frame (anclado al fondo)
- Solo la pestaña de la sección activa muestra color brand
- Máximo 4 pestañas (research: pestañas 4-5 tienen <5% de uso)
- No usar en L2/L3 — rompe el flujo de navegación

---

## Uso en patrones

| Patrón | Tab activo | Posición |
|---|---|---|
| `dashboard` | `tab-Inicio` | Order final |
| `lista-con-filtros` | Tab de la sección | Order final |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| tab-bar en pantalla de detalle (L2) | Patrón incorrecto | Eliminar tab-bar en L2/L3 |
| Ningún tab activo | Estado inicial incorrecto | Siempre un tab activo según sección |
| Más de 4 tabs | Demasiadas secciones | Usar "Más" como quinta opción con menú |