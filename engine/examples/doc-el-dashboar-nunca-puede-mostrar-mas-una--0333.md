# Template: Dashboard Principal de Cuenta Bancaria

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** el-dashboar-nunca-puede-mostrar-mas-una-
- **Tipo:** dashboard
- **Categoría:** accounts
- **Nodo Figma:** `452:368`
- **Score DS:** 93% - APROBADO
- **Patrón:** dashboard

## DESCRIPCIÓN
Pantalla principal tipo dashboard que muestra el resumen financiero del usuario, limitado estrictamente a una única cuenta bancaria. Presenta el saldo principal, la evolución temporal mediante un gráfico sparkline, notificaciones contextuales y el acceso al detalle de la cuenta. Está dirigida al usuario autenticado como punto de entrada principal de la aplicación.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  navigation-header                                      │
│  Barra de navegación superior fija                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  amount-display                                         │
│  Saldo o importe principal de la cuenta                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │  chart-sparkline                                  │  │
│  │  Gráfico de evolución temporal del saldo          │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │  notification-banner                              │  │
│  │  Banner de aviso contextual del sistema           │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────┐  │
│  │  card-accounts                                    │  │
│  │  Selector visual de cuenta bancaria (máx. 1)     │  │
│  └───────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────┤
│  tab-bar                                                │
│  Barra de navegación principal por pestañas (fija)      │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `170:2653` | default | Elemento fijo en la parte superior. Contiene título y acciones de navegación |
| 1 | amount-display | `185:3906` | primary / large | Visualización del saldo o importe principal de la cuenta única |
| 2 | chart-sparkline | `137:1746` | default | Gráfico sparkline de evolución temporal del saldo de la cuenta |
| 3 | notification-banner | `185:3903` | contextual | Banner de notificación contextual. Muestra avisos del sistema al usuario |
| 4 | card-accounts | `307:1164` | single | Selector visual de cuenta bancaria. Limitado a mostrar una única cuenta |
| 5 | tab-bar | `185:3900` | default / home-active | Barra de navegación principal por pestañas. Anclada en la parte inferior |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding | 0px (gestionado por cada componente internamente) |
| Padding Top | 0px (navigation-header flush) |
| Padding Bottom | 0px (tab-bar flush) |
| Fondo | `$color-background-primary` |
| Ancho | 390px |
| Alto | fill-container |
| Overflow | scroll (zona central entre header y tab-bar) |
| Safe Area Top | aplicada al navigation-header |
| Safe Area Bottom | aplicada al tab-bar |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `$color-background-primary` | #FFFFFF |
| `$color-text-primary` | #1A1A1A |
| `$color-text-secondary` | #6B7280 |
| `$color-accent-primary` | #0066FF |
| `$color-chart-line` | #0066FF |
| `$color-chart-area` | rgba(0, 102, 255, 0.08) |
| `$color-notification-bg` | #FFF8E1 |
| `$color-notification-text` | #B45309 |
| `$color-card-bg` | #F9FAFB |
| `$color-card-border` | #E5E7EB |
| `$spacing-xs` | 4px |
| `$spacing-sm` | 8px |
| `$spacing-md` | 16px |
| `$spacing-lg` | 24px |
| `$spacing-xl` | 32px |
| `$radius-card` | 12px |
| `$radius-banner` | 8px |
| `$font-amount-size` | 32px |
| `$font-amount-weight` | 700 |
| `$font-body-size` | 14px |
| `$font-caption-size` | 12px |
| `$font-family` | System Default (SF Pro / Roboto) |
| `$elevation-card` | 0px 1px 3px rgba(0,0,0,0.08) |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en navigation-header → icono perfil | Pantalla de perfil / configuración |
| Tap en navigation-header → icono notificaciones | Centro de notificaciones |
| Tap en chart-sparkline | Detalle de evolución temporal ampliada |
| Tap en notification-banner | Pantalla de detalle de la notificación o acción contextual |
| Dismiss notification-banner (swipe / close) | Ocultar banner, permanece en dashboard |
| Tap en card-accounts | Detalle de la cuenta bancaria seleccionada |
| Tap en tab-bar → Inicio | Dashboard (estado actual / activo) |
| Tap en tab-bar → Movimientos | Listado de movimientos / transacciones |
| Tap en tab-bar → Transferencias | Flujo de transferencias |
| Tap en tab-bar → Más | Menú de opciones adicionales |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001: Cuenta única | El dashboard **nunca puede mostrar más de una cuenta**. El componente `card-accounts` debe renderizar exclusivamente una única tarjeta de cuenta, independientemente de cuántas cuentas tenga el usuario en el sistema |
| RN-002: Selección por defecto | Si el usuario dispone de múltiples cuentas en backend, el sistema debe preseleccionar la cuenta principal (marcada como favorita o la de mayor antigüedad) y mostrar únicamente esa |
| RN-003: Coherencia de datos | El `amount-display` y el `chart-sparkline` deben reflejar siempre los datos correspondientes a la única cuenta mostrada en `card-accounts`. No se permite mostrar saldos agregados de múltiples cuentas |
| RN-004: Notificación contextual | El `notification-banner` es condicional: solo se muestra cuando existen avisos activos del sistema. Si no hay notificaciones, el espacio se colapsa y no se renderiza el componente |
| RN-005: Sparkline temporal | El `chart-sparkline` muestra por defecto la evolución del último mes. El rango temporal no es configurable directamente desde el dashboard |
| RN-006: Formato de saldo | El `amount-display` debe mostrar el saldo formateado según la moneda local del usuario (símbolo, separadores de miles y decimales) |
| RN-007: Actualización de datos | Los datos del dashboard deben actualizarse al realizar pull-to-refresh o al volver a la pantalla desde background |
| RN-008: Estado vacío | Si el usuario no tiene ninguna cuenta, no se muestra este dashboard; se redirige a un flujo de onboarding o apertura de cuenta |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header | `170:2653` | Fijo en parte superior. Contiene título del dashboard y acciones rápidas (perfil, notificaciones) |
| amount-display | `185:3906` | Saldo principal de la cuenta única. Tipografía destacada, formato monetario local |
| chart-sparkline | `137:1746` | Gráfico de tendencia del saldo. Rango por defecto: último mes. Sin interacción de zoom |
| notification-banner | `185:3903` | Condicional. Se muestra solo con avisos activos. Permite dismiss o navegación a detalle |
| card-accounts | `307:1164` | Muestra **exactamente una cuenta**. Restricción de negocio: máximo 1 elemento visible |
| tab-bar | `185:3900` | Fijo en parte inferior. Pestaña "Inicio" en estado activo. Navegación principal