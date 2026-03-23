# card-composition

## Descripción
Componente compuesto con 3 slots. La IA decide qué contenido va en cada slot
basándose en el brief y las reglas de composición. El diseñador puede aprobar,
modificar o rechazar la propuesta.

## Slots

| Slot    | Posición | Contenido permitido                        | Requerido |
|---------|----------|--------------------------------------------|-----------|
| header  | top      | title, title+badge, title+avatar, title+icon | sí      |
| content | middle   | text, image+text, metrics, list            | sí        |
| action  | bottom   | button-primary, button-secondary, link, empty | no     |

## Tokens del DS (de Figma Simple DS)
| Token | Valor |
|-------|-------|
| background | `#ffffff` (`Background/Default/Default`) |
| border | `1px solid #f1f5f9` (`Border/Default/Subtle`) |
| border-radius | `8px` (`Radius/Component/SM`) |
| padding | `16px 16px 12px` (`Padding/Horizontal/MD` + `Padding/Vertical/MD`) |
| gap entre slots | `8px` (`Size/8`) |
| title font-size | `14px` bold (`Body Strong`) |
| title color | `#0f172a` (`Text/Default/Default`) |
| subtitle font-size | `12px` (`Caption Strong`) |
| subtitle color | `#475569` (`Text/Default/Secondary`) |
| value color | `#64748b` (`Text/Neutral/Default`) |

## Reglas de composición por slot

### Slot header
- Siempre lleva `title` (string, máx 40 chars)
- `badge` es opcional — se muestra a la derecha del título
- `avatar` y `icon` son mutuamente excluyentes — si hay avatar no hay icon
- Si hay `avatar`, el título va a la derecha del avatar

### Slot content
- `text` — subtítulo o descripción corta (máx 80 chars)
- `image+text` — imagen a la izquierda (40%), texto a la derecha (60%)
- `metrics` — 2 o 3 valores numéricos con etiqueta (ej: rentabilidad, riesgo)
- `list` — máx 3 ítems con bullet o icono

### Slot action
- `empty` — sin acciones (solo informativo)
- `button-primary` — una acción principal
- `button-secondary` — una acción secundaria (siempre acompañada de primary)
- `link` — enlace de texto (máx 20 chars)

## Variantes generadas por combinación de slots

| Variante ID | Header | Content | Action |
|-------------|--------|---------|--------|
| `card-simple` | title | text | empty |
| `card-action` | title | text | button-primary |
| `card-media` | title+badge | image+text | button-primary |
| `card-metric` | title+badge | metrics | link |
| `card-profile` | title+avatar | text | button-secondary |
| `card-list` | title+icon | list | button-primary |
| `card-double-action` | title | text | button-primary + button-secondary |

## Reglas de exclusión
- No combinar `avatar` + `image` en la misma card
- `metrics` no se combina con `image`
- Si `action` tiene 2 botones, el contenido debe ser `text` o `list` (no `image`)
- badge en header: máx 1, texto máx 8 chars

## Cómo lo usa el engine
1. El IntentParser detecta que el brief necesita una card compuesta
2. El SlotResolver lee este contrato y decide qué slot combination usar
3. El UX Writer rellena los props de texto de cada slot
4. El renderer construye el HTML combinando los slots

## Node IDs en Figma
- Componente base card-item: `1:13`
- card-item/financial: `137:1758`
- Pendiente: crear `card-composition` como nuevo componente en Simple DS

## Siguiente paso para Figma
Crear en Simple DS un componente `card-composition` con:
- Layer `slot/header` — Auto Layout horizontal, gap 8px
- Layer `slot/content` — Auto Layout vertical, gap 4px  
- Layer `slot/action` — Auto Layout horizontal, gap 8px
- Padding exterior: 16px horizontal, 12px vertical
- Border: 1px solid `Border/Default/Subtle`
- Border radius: 8px
- Gap entre slots: 8px vertical
