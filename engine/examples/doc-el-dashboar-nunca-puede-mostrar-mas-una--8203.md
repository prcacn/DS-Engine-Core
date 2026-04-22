# Template: Dashboard Principal de Cuenta

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** el-dashboar-nunca-puede-mostrar-mas-una-
- **Tipo:** dashboard
- **Categoría:** accounts
- **Nodo Figma:** `452:368`
- **Score DS:** 93% - APROBADO
- **Patrón:** dashboard

## DESCRIPCIÓN
Pantalla principal de tipo dashboard que presenta al usuario una vista consolidada de su cuenta bancaria, incluyendo el saldo principal, un gráfico de evolución temporal (sparkline), notificaciones contextuales y el selector de cuentas. El dashboard está diseñado para mostrar exclusivamente una única cuenta a la vez, proporcionando una experiencia enfocada y clara. Está dirigido a usuarios autenticados que acceden a la vista principal de la aplicación.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header]               navigation-header    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  $ 12,345.67                    amount-display     │  │
│  │  Saldo disponible                                 │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ╱╲    ╱╲                                         │  │
│  │ ╱  ╲╱╱  ╲╱╲   ──────────     chart-sparkline     │  │
│  │╱          ╲╱                                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ⚠  Notificación contextual  notification-banner  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  ┌─────────┐                                      │  │
│  │  │  Cuenta  │                   card-accounts      │  │
│  │  │  ****123 │                                      │  │
│  │  └─────────┘                                      │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🏠 Home  💳 Cards  📊 Stats  👤 Profile    tab-bar    │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `170:2653` | default | Barra de navegación superior. Elemento fijo en la parte alta de la pantalla. |
| 1 | amount-display | `185:3906` | primary / large | Componente de visualización de saldo o importe principal. Muestra el monto de la cuenta seleccionada. |
| 2 | chart-sparkline | `137:1746` | default | Gráfico sparkline de evolución temporal. Muestra la tendencia del saldo o movimientos recientes. |
| 3 | notification-banner | `185:3903` | informational | Banner de notificación contextual. Muestra avisos del sistema relevantes para el usuario. |
| 4 | card-accounts | `307:1164` | single | Selector visual de cuentas bancarias. Muestra la cuenta del usuario. Limitado a una sola cuenta visible. |
| 5 | tab-bar | `185:3900` | default / home-active | Barra de navegación principal por pestañas. Anclada en la parte inferior de la pantalla. |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding | 0px (top: 0, right: 0, bottom: 0, left: 0) |
| Content Padding | 16px (horizontal), 12px (vertical entre componentes internos) |
| Fondo | `$color-background-primary` / `$color-neutral-white` |
| Ancho | 390px |
| Alto | Fill / Stretch (viewport completo) |
| Header Position | Fixed Top |
| Tab Bar Position | Fixed Bottom |
| Content Area | Scrollable (entre header y tab-bar) |
| Alignment | Stretch (horizontal) |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `$color-background-primary` | #FFFFFF |
| `$color-text-primary` | #1A1A1A |
| `$color-text-secondary` | #6B7280 |
| `$color-amount-primary` | #1A1A1A |
| `$color-sparkline-stroke` | #3B82F6 |
| `$color-sparkline-fill` | rgba(59, 130, 246, 0.1) |
| `$color-notification-bg` | #FEF3C7 |
| `$color-notification-text` | #92400E |
| `$color-card-bg` | #F9FAFB |
| `$color-card-border` | #E5E7EB |
| `$color-tab-active` | #3B82F6 |
| `$color-tab-inactive` | #9CA3AF |
| `$spacing-xs` | 4px |
| `$spacing-sm` | 8px |
| `$spacing-md` | 12px |
| `$spacing-lg` | 16px |
| `$spacing-xl` | 24px |
| `$font-size-amount` | 32px |
| `$font-weight-amount` | 700 (Bold) |
| `$font-size-label` | 14px |
| `$font-size-body` | 16px |
| `$radius-card` | 12px |
| `$radius-banner` | 8px |
| `$shadow-card` | 0px 1px 3px rgba(0,0,0,0.1) |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en navigation-header (botón atrás/menú) | Apertura de menú lateral o navegación contextual |
| Tap en amount-display | Detalle de saldo / desglose de cuenta |
| Tap en chart-sparkline | Pantalla de estadísticas ampliadas / gráfico detallado |
| Tap en notification-banner | Deep link al contenido de la notificación o dismiss |
| Tap en card-accounts | Detalle de la cuenta seleccionada |
| Tap en tab-bar → Home | Dashboard (pantalla actual, estado activo) |
| Tap en tab-bar → Cards | Pantalla de tarjetas asociadas |
| Tap en tab-bar → Stats | Pantalla de estadísticas y análisis financiero |
| Tap en tab-bar → Profile | Pantalla de perfil y configuración del usuario |
| Pull-to-refresh en content area | Recarga de datos del dashboard (saldo, gráfico, notificaciones) |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001: Cuenta única visible | El dashboard nunca puede mostrar más de una cuenta simultáneamente. Si el usuario tiene múltiples cuentas, se debe mostrar únicamente la cuenta principal o la última seleccionada. El componente `card-accounts` debe renderizar exclusivamente una tarjeta de cuenta. |
| RN-002: Saldo en tiempo real | El `amount-display` debe reflejar el saldo más reciente disponible de la cuenta mostrada. En caso de error de carga, mostrar el último saldo conocido con indicador de desactualización. |
| RN-003: Sparkline coherente | El `chart-sparkline` debe representar datos de evolución correspondientes exclusivamente a la cuenta que se está visualizando, no datos agregados de múltiples cuentas. |
| RN-004: Notificaciones contextuales | El `notification-banner` debe mostrar únicamente avisos relevantes para la cuenta activa o avisos globales del sistema. Si no hay notificaciones pendientes, el componente no debe renderizarse y el espacio debe colapsarse. |
| RN-005: Selección de cuenta persistente | Si el usuario selecciona una cuenta diferente desde otro flujo, al regresar al dashboard se debe mantener la última cuenta seleccionada como la visible. |
| RN-006: Estado vacío | Si el usuario no tiene cuentas asociadas, el dashboard debe mostrar un estado vacío con llamada a la acción para vincular o abrir una cuenta. Los componentes `amount-display`, `chart-sparkline` y `card-accounts` no deben renderizarse. |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header | `170:2653` | Fijo en la parte superior. Contiene título de pantalla y acciones contextuales (menú, notificaciones). |
| amount-display | `185:3906` | Muestra el saldo principal