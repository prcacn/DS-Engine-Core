# button-primary

## Descripción
Botón de acción principal. Representa la acción más importante de la pantalla. Siempre en color brand y con máximo contraste. Solo puede haber uno por pantalla.

---

## Variantes
Componente simple — sin variantes de tipo. Una sola definición.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:9` | 88×48px (base) — se estira al ancho disponible | CTA principal de cualquier pantalla |

---

## Estructura visual
```
┌──────────────────────────────────────┐
│ ←16px  [label "Continuar"]  16px→   │  48px altura · radius 8px
└──────────────────────────────────────┘
```
- Fondo: `rgb(79,70,229)` — `Background/Brand/Default`
- Label: DM Sans Regular 12px · color `#FFFFFF` — `Text/Default/nochange`
- Layout: HORIZONTAL · padding H: 16px · padding V: 8px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `label` | TEXT | `"Continuar"` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 8px → `Spacing/Padding/Vertical/MD` |
| gap | 0px |
| borderRadius | 8px → `Spacing/Radius/Component/SM` |
| width | fill container (390px en pantalla completa) |
| height | 48px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Brand/Default` | `rgb(79,70,229)` |
| Label | `Text/Default/nochange` | `#FFFFFF` |
| Fuente | DM Sans Regular 12px | `typography/label` |
| Padding H | `Spacing/Padding/Horizontal/MD` | `16px` |
| Padding V | `Spacing/Padding/Vertical/MD` | `8px` |
| Radio | `Spacing/Radius/Component/SM` | `8px` |

---

## Cuándo usarlo
- CTA de confirmación de una acción importante
- Botón de submit en formularios
- Acción principal al final de un flujo

## Cuándo NO usarlo
- Como segunda acción — usar `button-secondary`
- Cuando la acción es destructiva sin confirmación previa
- Cuando ya hay un `button-primary` en la pantalla

---

## Restricciones
- **Máximo 1 por pantalla** — regla de exclusividad
- El label SIEMPRE en infinitivo y descriptivo: "Confirmar transferencia", nunca "OK" o "Enviar"
- No usar en `navigation-header` ni en `filter-bar`
- En L3: siempre el primer botón del bloque de acciones

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `formulario-simple` | Final de pantalla, fijo al fondo | Submit del formulario |
| `confirmacion` | Primer botón en Actions zone | Confirmar la acción |
| `detalle` | Final de contenido | CTA de contratación o acción |
| `empty-state` | Dentro del componente | Acción para salir del estado vacío |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Dos button-primary en pantalla | Composición incorrecta | Convertir el segundo en `button-secondary` |
| Label "Continuar" genérico | Falta de descripción | Usar verbo + objeto: "Confirmar pago" |
| Botón muy pequeño | No se estira al ancho | Usar `fill container` en el ancho |