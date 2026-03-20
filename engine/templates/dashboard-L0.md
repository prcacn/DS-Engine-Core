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

**Cuando el diseñador solicite "dashboard" o cualquier keyword de esta lista, el engine pinta EXACTAMENTE esta pantalla — no genera desde cero.**

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header · Type=Dashboard]         56px      │
│  ← menú                             campana →          │
├─────────────────────────────────────────────────────────┤
│  padding 16px                        padding 16px       │
│  [amount-display]                             126px     │
│  Saldo principal / resumen financiero                   │
│                                                         │
│  [card-item/financial]                        72px      │
│  [card-item/financial]                        72px      │
│  [card-item/financial]                        72px      │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [tab-bar]                                    56px      │
│  Inicio ●  |  Mercado  |  Cartera  |  Perfil           │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante Figma | Notas |
|-------|------------|---------|----------------|-------|
| 0 | navigation-header | `170:2660` | `Type=Dashboard` | Sin título en header. Icono menú izquierda, campana derecha. Padding H: 16px |
| 1 | amount-display | `137:1740` | default | Saldo principal o resumen financiero clave. 126px altura |
| 2 | card-item/financial ×3 | `137:1758` | default | Accesos rápidos a productos. Se repite 3 veces. 72px altura c/u |
| 3 | tab-bar | `20:784` | home-active | SIEMPRE el último. Pestaña Inicio activa. 56px altura |

## COMPONENTES OPCIONALES

| Componente | Node ID | Cuándo incluirlo |
|---|---|---|
| `notification-banner` | `20:802` | Si hay aviso activo del sistema. Máximo 1. Va justo bajo el navigation-header |
| `chart-sparkline` | `137:1746` | Si se muestra evolución de cartera o saldo |
| `list-header` | `20:797` | Para separar secciones de contenido |
| `skeleton-loader` | `137:1752` | Durante la carga inicial de datos |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding horizontal | 16px |
| Padding top | 0px |
| Padding bottom | 0px (tab-bar ocupa el fondo) |
| Fondo | `#FFFFFF` — color/background/default/default |
| Ancho | 390px |
| Alto | 844px |

## REGLAS DE NIVEL L0

- `navigation-header` SIEMPRE con `Type=Dashboard` — sin título en el header, sin botón de volver
- `tab-bar` SIEMPRE presente y SIEMPRE el último componente (orden: 3)
- No puede contener formularios (`input-text`)
- No puede ser punto de llegada de un flujo destructivo
- Siempre es la pantalla de retorno tras completar un flujo L2→L3

## NAVEGACIÓN

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en tab Mercado | Lista de mercado | → L1 |
| Tap en tab Cartera | Lista de cartera | → L1 |
| Tap en tab Perfil | Perfil de usuario | → L1 |
| Tap en card-item/financial | Detalle del producto | → L2 |
| Tap en notification-banner | Detalle del aviso | → L2 |

## RESTRICCIONES

- Solo puede existir UNA pantalla L0 en el flujo
- `navigation-header` SIEMPRE `Type=Dashboard` — nunca `Type=Modal` ni `Type=Predeterminada`
- `tab-bar` siempre presente y siempre el último componente
- No mezclar con `input-text` ni `modal-bottom-sheet`
