# Nivel L2 — Detail / Action (Detalle o Acción)

## IDENTIFICACIÓN
- **Nivel:** L2
- **Nombre:** Detail / Action
- **Node ID Figma:** `107:1906`
- **Página Figma:** Pattern Navigation
- **Dimensiones:** 390 × 844px
- **Fondo:** `#F1F5F9` (neutral/300)

## DESCRIPCIÓN
Pantalla de detalle de un item o inicio de una acción. Accesible desde L1. Siempre tiene botón de volver — el usuario puede cancelar y retroceder. Sin tab-bar visible. El contenido puede ser un detalle de producto, un formulario, un flujo de datos, etc.

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header]                          64px      │
│  ← volver        Título de pantalla   ⋮ más            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              Área de contenido principal                │
│              (detalle, formulario, datos...)            │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES (ORDEN EXACTO)

| Orden | Componente | Node ID | Posición | Altura | Notas |
|-------|------------|---------|----------|--------|-------|
| 0 | navigation-header (Full modal) | `I107:1907;145:2147` | top: 0 | 64px | Con `← arrow-left` izquierda. Título en centro. `⋮ more-vertical` derecha. Padding H: 16px |
| 1 | Contenido | — | bajo header | libre | Detalle, formulario, datos del item |

## DIFERENCIAS CLAVE RESPECTO A L0/L1

| Aspecto | L0 / L1 | L2 |
|---------|---------|-----|
| navigation-header altura | 56px | **64px** |
| Botón izquierdo | Icono menú | **← arrow-left (volver)** |
| Botón derecho | Campana | **⋮ more-vertical (opciones)** |
| tab-bar | Visible | **Oculto** |
| Fondo frame | `#FFFFFF` | **`#F1F5F9`** (neutral/300) |
| Contenido | Scroll libre | Scroll entre header y CTA |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | NONE (posicionamiento absoluto) |
| Fondo | `#F1F5F9` — neutral/300 |
| Ancho | 390px |
| Alto | 844px |
| Padding | 0px |

## REGLAS DE NIVEL L2

- `navigation-header` SIEMPRE con `← arrow-left` — el usuario puede volver
- `tab-bar` NO incluir — la navegación global no es visible en L2
- La altura del navigation-header es **64px** (no 56px como en L0/L1)
- Puede contener `button-primary` fijo al fondo para la acción principal
- Puede contener `modal-bottom-sheet` para confirmaciones rápidas antes de ir a L3
- El fondo del frame es `#F1F5F9` — el contenido blanco destaca sobre él

## NAVEGACIÓN DESDE L2

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en ← arrow-left | Pantalla anterior | → L1 |
| Tap en button-primary (acción) | Confirmación | → L3 |
| Tap en ⋮ more-vertical | Opciones contextuales | — (sheet) |
