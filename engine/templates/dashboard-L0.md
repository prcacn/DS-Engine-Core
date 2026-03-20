# Template: Dashboard — Pantalla Principal (L0)

## IDENTIFICACIÓN
- **Template ID:** dashboard-L0
- **Nivel de navegación:** L0
- **Intent:** dashboard
- **Keywords:** dashboard, home, inicio, pantalla principal, pantalla de inicio, resumen de cuenta, vista general, accesos rápidos
- **Score mínimo requerido:** 80%
- **Estado:** aprobado

## DESCRIPCIÓN
Pantalla raíz de la aplicación. Punto de entrada tras el login. Muestra el estado general de la cuenta del usuario y los accesos rápidos a las secciones principales. Es la única pantalla L0 — solo existe una en toda la app.

## REGLAS DE NIVEL L0
- `navigation-header` obligatorio sin botón de volver (`variant: default`)
- `tab-bar` obligatorio — siempre visible, pestaña home activa
- No puede contener formularios
- No puede ser punto de llegada de un flujo destructivo
- Siempre es la pantalla de retorno tras completar un flujo L2→L3

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `1:3` | default | Sin botón de volver. Título de la app o saludo al usuario |
| 1 | amount-display | `137:1740` | default | Saldo principal o resumen financiero clave |
| 2 | card-item/financial | `137:1758` | default | Acceso rápido a producto principal (×1 mínimo, ×3 máximo) |
| 3 | tab-bar | `20:784` | home-active | Siempre último. Pestaña home activa |

## COMPONENTES OPCIONALES

| Componente | Cuándo incluirlo |
|---|---|
| `notification-banner` | Si hay aviso activo del sistema. Máximo 1. Va justo bajo el navigation-header |
| `chart-sparkline` | Si se muestra evolución de cartera o saldo |
| `list-header` | Para separar secciones de contenido |
| `skeleton-loader` | Durante la carga inicial de datos |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding horizontal | 16px |
| Padding top | 0px |
| Padding bottom | 0px (tab-bar ocupa el fondo) |
| Fondo | color-background-primary |
| Ancho | 390px |
| Alto | 844px |

## NAVEGACIÓN

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en pestaña del tab-bar | Sección correspondiente | → L1 |
| Tap en card-item/financial | Detalle del producto | → L2 |
| Tap en notification-banner | Detalle del aviso | → L2 |

## RESTRICCIONES

- Solo puede existir UNA pantalla L0 en el flujo
- `navigation-header` siempre sin `variant: with-back`
- `tab-bar` siempre presente y siempre el último componente
- No mezclar con componentes de formulario (`input-text`)
- No usar `modal-bottom-sheet` en L0 salvo para avisos de sistema no bloqueantes
