# button-secondary

## Node ID en Figma
185:3894

## Descripción
Botón secundario para acciones de menor importancia que complementan la acción principal. Se usa para opciones alternativas, cancelar o acciones de soporte. Visualmente menos prominente que el botón primario, mantiene la jerarquía visual.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `Predeterminada` | `1:11` | 83×48px | Estado normal del botón secundario, listo para interacción |

---

## Estructura visual
```
┌─────────────────────────────┐ 83×48px
│  ┌─────────────────────────┐  │
│  │        LABEL TEXT       │  │ DM Sans Medium
│  │      (Sky/100)          │  │ Color: Background/Info/Subtle
│  └─────────────────────────┘  │
└─────────────────────────────┘
Border: stroke color
Background: subtle fill
Radius: 8px corners
```

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `State` | enum | `Predeterminada` | No |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → Spacing/Padding/Horizontal/MD |
| paddingTop / Bottom | 12px → Spacing/Padding/Vertical/LG |
| gap | 8px → Spacing/Gap/MD |
| borderRadius | 8px → Spacing/Radius/Component/SM |
| width | 83px (hug contents) |
| height | 48px |

---

## Tokens consumidos

| Elemento | Token semántico | Valor |
|---|---|---|
| container background | `Background/Info/Subtle` | `sky/100` |
| container border | `Border/Secondary` | `stroke color` |
| label text | `Background/Info/Subtle` | `sky/100` |
| text typography | `Typography/Body/Medium` | `DM Sans Medium` |

---

## Cuándo usarlo
- Acompañar un botón primario como opción alternativa
- Acciones de cancelar o cerrar en modales y formularios
- Opciones secundarias en cards o listas que no requieren máxima prominencia

## Cuándo NO usarlo
- Acción principal de una pantalla — usar button-primary
- Acciones destructivas — usar button-destructive

---

## Restricciones
- Máximo 2 palabras en el label para mantener el ancho óptimo
- No usar más de 2 botones secundarios juntos sin jerarquía clara

---

## Reglas de negocio

| Regla | Descripción |
|---|---|
| jerarquia-visual | Siempre debe ser visualmente menos prominente que el botón primario cuando aparecen juntos |
| accion-reversible | Preferentemente para acciones que se pueden deshacer o no son destructivas |
---

## Uso en patrones

| Patrón | Posición | Repeticiones |
|---|---|---|
| `button-pair` | A la izquierda del botón primario en disposición horizontal | ×1 |
| `modal-actions` | En footer de modales como acción de cancelar | ×1 |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Usar para acciones principales | Confundir jerarquía de botones | Usar button-primary para la acción más importante |
| Textos muy largos que rompen el diseño | No considerar el ancho limitado | Usar máximo 2 palabras, abreviar si es necesario |

---

## Slots

| Nombre | Contenido esperado |
|---|---|
| `label` | Texto del botón, preferentemente 1-2 palabras |

## Eventos

| Evento | Cuándo se emite | Payload |
|---|---|---|
| `onPress` | Usuario toca el botón | action type y context data |
---

## Navegación

| Acción | Destino |
|---|---|
| click en botón | Acción secundaria o navegación alternativa según contexto |
---

## Zona en pantalla
`content` — zona de contenido principal
**Repetible:** puede aparecer N veces.

---

## Keywords para brief
button, secondary, action, cancel, alternative
