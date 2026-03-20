# Template: Lista de Fondos — Sección Principal (L1)

## IDENTIFICACIÓN
- **Template ID:** lista-fondos-L1
- **Nivel de navegación:** L1
- **Intent:** lista-con-filtros
- **Keywords:** lista de fondos, fondos de inversión, mis fondos, cartera, posiciones, listado de productos, ver fondos
- **Score mínimo requerido:** 80%
- **Estado:** aprobado

## DESCRIPCIÓN
Pantalla de sección L1 que muestra el listado de fondos o productos financieros del usuario. Accesible desde el tab-bar del dashboard. Permite filtrar por categoría y acceder al detalle de cada fondo.

## REGLAS DE NIVEL L1
- `navigation-header` obligatorio sin botón de volver (`variant: default`)
- `tab-bar` obligatorio — siempre visible, pestaña correspondiente activa
- El contenido es scrollable entre header y tab-bar
- No puede contener CTAs destructivos
- Siempre tiene una ruta de vuelta a L0 a través del tab-bar

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `1:3` | default | Sin botón de volver. Título de la sección |
| 1 | filter-bar | `1:24` | chips | Filtros por categoría: Todos, Renta fija, Renta variable, Mixtos |
| 2 | list-header | `20:797` | default | Título del grupo (ej: "Tus fondos · 3 productos") |
| 3 | card-item/financial | `137:1758` | default | Un card por fondo (×N según cartera del usuario) |
| 4 | tab-bar | `20:784` | funds-active | Siempre último. Pestaña fondos activa |

## COMPONENTES OPCIONALES

| Componente | Cuándo incluirlo |
|---|---|
| `empty-state` | Si el usuario no tiene fondos. Reemplaza card-item/financial |
| `notification-banner` | Si hay restricción de acceso activa (ej: perfil de riesgo incompleto) |
| `skeleton-loader` | Durante la carga inicial del listado |
| `badge` | En el list-header para mostrar el número de productos |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 0px (card-items van sin gap entre ellos) |
| Padding horizontal | 0px (cards edge-to-edge) |
| Padding top | 0px |
| Padding bottom | 0px (tab-bar ocupa el fondo) |
| Fondo | color-background-secondary |
| Ancho | 390px |
| Alto | 844px |

## NAVEGACIÓN

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en card-item/financial | Detalle del fondo | → L2 |
| Tap en filter-bar chip | Filtrado en la misma pantalla | — |
| Tap en pestaña del tab-bar | Sección correspondiente | → L1 |
| Tap en home del tab-bar | Dashboard | → L0 |

## RESTRICCIONES

- `navigation-header` siempre sin `variant: with-back`
- `tab-bar` siempre presente y siempre el último componente
- `empty-state` y `card-item/financial` son mutuamente excluyentes
- `filter-bar` siempre va justo debajo del navigation-header
- Máximo 1 `notification-banner` por pantalla
