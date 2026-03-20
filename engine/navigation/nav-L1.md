# Nivel L1 — Section (Sección Principal)

## IDENTIFICACIÓN
- **Nivel:** L1
- **Nombre:** Section
- **Node ID Figma:** `107:1904`
- **Página Figma:** Pattern Navigation
- **Dimensiones:** 390 × 844px
- **Fondo:** `#FFFFFF`

## DESCRIPCIÓN
Pantalla de sección principal. Accesible directamente desde el tab-bar del L0. Muestra el contenido de una sección completa (lista, historial, perfil...). El usuario no necesita botón de volver — puede navegar entre secciones usando el tab-bar.

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header]                          56px      │
│  ← icono menú   Título de sección   campana →          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              Área de contenido de sección               │
│              (lista, cards, historial...)               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [tab-bar]                                    56px      │
│  Inicio  |  Mercado  ●  |  Cartera  |  Perfil          │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES (ORDEN EXACTO)

| Orden | Componente | Node ID | Posición | Altura | Notas |
|-------|------------|---------|----------|--------|-------|
| 0 | navigation-header | `170:2764` | top: 0 | 56px | Sin botón volver. Padding H: 16px. Título de la sección en centro |
| 1 | tab-bar | `170:2256` | bottom: 0 | 56px | Tab activo corresponde a la sección actual |

## DIFERENCIAS CON L0

| Aspecto | L0 | L1 |
|---------|----|----|
| navigation-header | Icono menú + campana | Icono menú + título + campana |
| tab-bar | Tab "Inicio" activo | Tab de la sección activa |
| Contenido | Hub con resumen | Contenido completo de sección |
| Acceso | Siempre visible (home) | Desde tab-bar |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | NONE (posicionamiento absoluto) |
| Fondo | `#FFFFFF` |
| Ancho | 390px |
| Alto | 844px |
| Padding | 0px |

## REGLAS DE NIVEL L1

- `navigation-header` sin botón de volver — la navegación entre secciones es el tab-bar
- `tab-bar` siempre visible con la pestaña de la sección actual activa
- El contenido es scrollable entre header y tab-bar
- No puede contener CTAs destructivos ni flujos irreversibles
- Siempre hay ruta de vuelta a L0 mediante el tab-bar

## NAVEGACIÓN DESDE L1

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en item de la lista | Detalle del item | → L2 |
| Tap en tab-bar (otra sección) | Sección correspondiente | → L1 |
| Tap en tab Inicio | Dashboard | → L0 |
| Tap en CTA de acción | Formulario o flujo | → L2 |
