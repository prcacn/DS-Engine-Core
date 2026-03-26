# modal-bottom-sheet

## Node ID en Figma
1:36

## Component Set ID
185:3899  ← COMPONENT_SET padre (no instanciar directamente)

## Descripción
Modal que emerge desde la parte inferior de la pantalla. Se usa para confirmaciones, acciones destructivas o contenido contextual que requiere atención sin abandonar el flujo principal.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:36` | 390×255px | Modal de confirmación o acción contextual |

---

## Estructura visual
```
390px · 255px altura
┌─────────────────────────────────────────────────────────┐
│ padding 24px H · 24px V                                 │
│              [handle 36×4px]           ← barra de drag  │
│                                                         │
│  [title "Título del modal"]            24px DM Sans Bold│
│                                                         │
│  [description]                         14px DM Sans Reg │
│                                                         │
│  [buttons: primary + secondary 104px]                  │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `#FFFFFF`
- Layout: VERTICAL · padding H: 16px · padding V: 24px · gap: 12px
- Handle: rectángulo 36×4px centrado — indica que es arrastrable

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | `"Título del modal"` | Sí |
| `description` | TEXT | `"Descripción de la acción..."` | Sí |
| `buttons` | FRAME | primary + secondary | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | VERTICAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 24px → `Spacing/Padding/Vertical/LG` |
| gap | 12px → `Spacing/Gap/LG` |
| width | 390px |
| height | 255px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Título | `Text/Default/Default` 24px Bold | `rgb(15,23,42)` |
| Descripción | `Text/Neutral/Default` 14px Regular | `rgb(71,85,105)` |
| Handle | `Background/Neutral/Default` | neutral/400 |

---

## Cuándo usarlo
- Confirmación de acciones importantes antes de ejecutarlas
- Acciones destructivas (eliminar, cancelar contrato)
- Contenido contextual complementario sin salir del flujo

## Cuándo NO usarlo
- Como pantalla completa — usar `Full modal` (L2/L3)
- En L0 (dashboard) salvo avisos de sistema no bloqueantes
- Para mostrar formularios largos — usar pantalla L2 completa
- Cuando la acción no requiere confirmación

---

## Restricciones
- **Máximo 1 abierto al mismo tiempo**
- El título siempre describe la acción, no el componente: "¿Cancelar transferencia?"
- La descripción explica consecuencias: "Esta acción no se puede deshacer"
- Siempre incluye `button-secondary` (cancelar) además del `button-primary`

---

## Uso en patrones

| Patrón | Cuándo | Variante |
|---|---|---|
| `confirmacion` | Acción principal antes de ejecutar | `confirmation` |
| `detalle` | Inicio de contratación antes de ir a L3 | `default` |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Modal sin botón cancelar | Falta button-secondary | Siempre incluir opción de escape |
| Título genérico "Confirmar" | Sin descripción de la acción | "¿Confirmar transferencia de 500€?" |
| Modal en L0 | Contexto incorrecto | Reservar para L2/L3 o avisos de sistema |