# Nivel L0 — Root (Pantalla Principal)

## IDENTIFICACIÓN
- **Nivel:** L0
- **Nombre:** Root
- **Node ID Figma:** `107:1901`
- **Página Figma:** Pattern Navigation
- **Dimensiones:** 390 × 844px
- **Fondo:** `#FFFFFF`

## DESCRIPCIÓN
Pantalla raíz de la aplicación. Punto de entrada tras el login. Solo puede existir una pantalla L0 en toda la app. Es el hub de navegación principal — el usuario siempre vuelve aquí al completar un flujo.

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header]                          56px      │
│  ← icono menú                    icono campana →        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Title / Display]                            29px      │
│  Texto Display · rgb(20,20,26)                          │
│                                                         │
│              Área de contenido libre                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [tab-bar]                                    56px      │
│  Inicio  ●  |  Mercado  |  Cartera  |  Perfil          │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES (ORDEN EXACTO)

| Orden | Componente | Node ID | Posición | Altura | Notas |
|-------|------------|---------|----------|--------|-------|
| 0 | navigation-header | `170:2755` | top: 0 | 56px | Sin botón volver. Icono menú izquierda, campana derecha. Padding H: 16px |
| 1 | Title (Display) | `170:2620` | libre | 29px | Texto tipo Display · color `#14141A` |
| 2 | tab-bar | `107:1903` | bottom: 0 | 56px | 4 tabs: Inicio ● · Mercado · Cartera · Perfil. Tab activo en índigo |

## TAB-BAR — ESTRUCTURA INTERNA

| Tab | Estado | Color activo | Color inactivo |
|-----|--------|-------------|----------------|
| Inicio | Activo ● | `rgb(79,70,229)` — brand primary | — |
| Mercado | Inactivo | — | `rgb(100,116,139)` — neutral 700 |
| Cartera | Inactivo | — | `rgb(100,116,139)` |
| Perfil | Inactivo | — | `rgb(100,116,139)` |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | NONE (posicionamiento absoluto) |
| Fondo | `#FFFFFF` |
| Ancho | 390px |
| Alto | 844px |
| Padding | 0px en todos los lados |

## REGLAS DE NIVEL L0

- `navigation-header` sin botón de volver — icono de menú o hamburguesa a la izquierda
- `tab-bar` siempre visible y siempre el último elemento (pegado al fondo)
- Sin `button-primary` fijo — los CTAs están dentro del contenido
- No puede ser destino de un flujo destructivo (confirmaciones, errores)
- Es la pantalla de retorno tras completar cualquier flujo L2 → L3

## NAVEGACIÓN DESDE L0

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap tab Mercado | Lista de mercado | → L1 |
| Tap tab Cartera | Lista de cartera | → L1 |
| Tap tab Perfil | Perfil de usuario | → L1 |
| Tap contenido del home | Detalle de producto | → L2 |
