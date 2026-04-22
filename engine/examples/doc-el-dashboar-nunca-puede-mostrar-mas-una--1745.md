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
Pantalla principal tipo dashboard que muestra el resumen financiero de una única cuenta bancaria del usuario. Presenta el saldo principal, la evolución temporal mediante un gráfico sparkline, notificaciones contextuales y un selector visual de cuentas. Está diseñada como punto de entrada principal de la aplicación, proporcionando una vista consolidada del estado financiero al usuario autenticado.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header]                          170:2653  │
│  Barra de navegación superior fija                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Amount Display]                             185:3906  │
│  Saldo o importe principal de la cuenta                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Chart Sparkline]                            137:1746  │
│  Gráfico de evolución temporal del saldo                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Notification Banner]                        185:3903  │
│  Banner de avisos contextuales del sistema              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Card Accounts]                              307:1164  │
│  Selector visual de cuenta bancaria (máx. 1)            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Tab Bar]                                    185:3900  │
│  Navegación principal por pestañas (fija inferior)      │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `170:2653` | default | Barra de navegación superior. Elemento fijo en la parte alta de la pantalla. Contiene título y acciones contextuales. |
| 1 | amount-display | `185:3906` | primary / large | Componente de visualización de saldo o importe principal. Muestra el monto destacado de la cuenta seleccionada. |
| 2 | chart-sparkline | `137:1746` | default | Gráfico sparkline de evolución temporal. Muestra la tendencia del saldo de la cuenta a lo largo del tiempo. |
| 3 | notification-banner | `185:3903` | informational | Banner de notificación contextual. Muestra avisos del sistema relevantes para el usuario. |
| 4 | card-accounts | `307:1164` | single | Selector visual de cuentas bancarias. Muestra la cuenta del usuario. Limitado a una sola cuenta visible. |
| 5 | tab-bar | `185:3900` | default / home-active | Barra de navegación principal por pestañas. Anclada en la parte inferior de la pantalla. |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding | 0px (contenido edge-to-edge; componentes internos aplican padding horizontal 16px) |
| Fondo | `color/background/primary` |
| Ancho | 390px |
| Alto | fill-container (viewport completo) |
| Overflow | scroll (zona central entre header y tab-bar) |
| Header position | fixed-top |
| Tab Bar position | fixed-bottom |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `color/background/primary` | #FFFFFF |
| `color/text/primary` | #1A1A1A |
| `color/text/secondary` | #6B7280 |
| `color/amount/positive` | #10B981 |
| `color/amount/negative` | #EF4444 |
| `color/chart/line` | #3B82F6 |
| `color/notification/background` | #FEF3C7 |
| `color/notification/text` | #92400E |
| `color/surface/card` | #F9FAFB |
| `color/border/subtle` | #E5E7EB |
| `spacing/gap/md` | 16px |
| `spacing/padding/screen` | 16px |
| `spacing/padding/none` | 0px |
| `radius/card` | 12px |
| `typography/heading/lg` | 28px / bold / 1.2 |
| `typography/body/md` | 16px / regular / 1.5 |
| `elevation/card` | 0 2px 8px rgba(0,0,0,0.08) |
| `safe-area/top` | env(safe-area-inset-top) |
| `safe-area/bottom` | env(safe-area-inset-bottom) |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en navigation-header → perfil/avatar | Pantalla de perfil de usuario |
| Tap en navigation-header → notificaciones (icono) | Centro de notificaciones |
| Tap en amount-display | Detalle de saldo / desglose de cuenta |
| Tap en chart-sparkline | Vista ampliada del gráfico de evolución |
| Tap en notification-banner | Detalle de la notificación o acción contextual asociada |
| Tap en notification-banner → dismiss | Oculta el banner de notificación |
| Tap en card-accounts | Detalle de la cuenta bancaria seleccionada |
| Tap en tab-bar → Inicio | Estado actual (dashboard) — ya activo |
| Tap en tab-bar → Movimientos | Pantalla de listado de movimientos / transacciones |
| Tap en tab-bar → Transferencias | Pantalla de transferencias / pagos |
| Tap en tab-bar → Más | Menú de opciones adicionales / configuración |
| Swipe-down (pull-to-refresh) | Refresca datos del dashboard (saldo, gráfico, notificaciones) |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001: Cuenta única visible | El dashboard nunca puede mostrar más de una cuenta. Si el usuario posee múltiples cuentas, se muestra únicamente la cuenta principal o la última seleccionada. El componente `card-accounts` debe renderizar como máximo 1 elemento. |
| RN-002: Saldo en tiempo real | El `amount-display` debe reflejar el saldo disponible actualizado. Si no es posible obtener datos en tiempo real, mostrar el último saldo conocido con indicador de timestamp. |
| RN-003: Sparkline coherente | El `chart-sparkline` debe representar la evolución del saldo de la misma cuenta mostrada en `card-accounts`. El rango temporal por defecto es los últimos 30 días. |
| RN-004: Notificación condicional | El `notification-banner` solo se renderiza cuando existen avisos activos del sistema. Si no hay notificaciones pendientes, el espacio se colapsa y no se muestra placeholder vacío. |
| RN-005: Ocultación de saldo | Si el usuario activa la opción de ocultar saldo, el `amount-display` debe enmascarar el importe (ej. `••••••`) manteniendo la interacción de tap para revelar. |
| RN-006: Estado vacío de cuenta | Si el usuario no tiene cuentas asociadas, el dashboard debe mostrar un estado vacío guiado con CTA para vincular o abrir una cuenta. Los componentes `amount-display`, `chart-sparkline` y `card-accounts` no se renderizan. |
| RN-007: Sesión autenticada | El dashboard solo es accesible para usuarios autenticados. Si la sesión expira, redirigir al flujo de autenticación. |
| RN-008: Tab activa | La `tab-bar` debe reflejar la pestaña "Inicio" como activa al estar en esta pantalla. |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header | `170:2653` | Fijo en la parte superior. Contiene título del dashboard, avatar de usuario y accesos directos (notificaciones, perfil). Respeta safe-area superior. |
| amount-display | `185:3906` | Muestra el saldo principal de la cuenta. Tipografía destacada. Soporta estado oculto/visible. Debe corresponder a la cuenta mostrada en card-accounts. |
| chart-sparkline | `137:1746` | Gráfico inline de tendencia temporal. Sin ejes visibles. Rango por defecto: 30 días. Color de línea según token `color/chart/line`. |
| notification-banner | `185:3903` | Banner contextual dismissible. Se renderiza condicionalmente. Soporta variantes: informational, warning, critical