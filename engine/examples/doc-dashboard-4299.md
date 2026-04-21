# Template: Dashboard Principal de Cuentas

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** dashboard
- **Tipo:** pantalla principal / home
- **Categoría:** accounts
- **Nodo Figma:** `417:135`
- **Score DS:** 96% - APROBADO
- **Patrón:** dashboard

## DESCRIPCIÓN
Pantalla principal del dashboard bancario que presenta al usuario una vista consolidada de su situación financiera. Muestra el saldo total disponible, un gráfico sparkline con la evolución temporal del balance y un listado de cuentas bancarias asociadas. Está dirigida al usuario autenticado como punto de entrada principal tras el login, proporcionando acceso rápido a las secciones clave de la aplicación mediante la barra de navegación inferior.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header]                                    │
│  Barra de navegación superior fija                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Amount Display]                                       │
│  Saldo o importe principal                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Chart Sparkline]                                      │
│  Gráfico de evolución temporal del balance              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Card Accounts]                                        │
│  Cuenta bancaria #1                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [Card Accounts]                                        │
│  Cuenta bancaria #2                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Tab Bar]                                              │
│  Navegación principal por pestañas (fija inferior)      │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `170:2653` | default | Barra de navegación superior. Elemento fijo en la parte alta de la pantalla |
| 1 | amount-display | `185:3906` | default | Componente de visualización de saldo o importe principal. Muestra el balance consolidado |
| 2 | chart-sparkline | `137:1746` | default | Gráfico sparkline de evolución temporal. Muestra la tendencia del balance |
| 3 | card-accounts | `307:1164` | default | Selector visual de cuentas bancarias. Primera cuenta del listado |
| 4 | card-accounts | `307:1164` | default | Selector visual de cuentas bancarias. Segunda cuenta del listado |
| 5 | tab-bar | `185:3900` | default | Barra de navegación principal por pestañas. Anclada en la parte inferior |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding Top | 0px (header fijo) |
| Padding Bottom | 0px (tab-bar fijo) |
| Padding Horizontal | 16px (contenido) |
| Fondo | $color-background-primary |
| Ancho | 390px |
| Alto | fill (viewport) |
| Scroll | Vertical (zona de contenido entre header y tab-bar) |
| Header Position | Fixed Top |
| Tab Bar Position | Fixed Bottom |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `$color-background-primary` | #FFFFFF |
| `$color-text-primary` | #1A1A1A |
| `$color-text-secondary` | #6B7280 |
| `$color-accent-primary` | #2563EB |
| `$color-chart-line` | #10B981 |
| `$color-border-subtle` | #E5E7EB |
| `$space-gap-md` | 16px |
| `$space-gap-sm` | 8px |
| `$space-padding-horizontal` | 16px |
| `$radius-card` | 12px |
| `$font-size-display` | 32px |
| `$font-size-body` | 14px |
| `$font-weight-bold` | 700 |
| `$font-weight-regular` | 400 |
| `$elevation-card` | 0px 2px 8px rgba(0,0,0,0.08) |
| `$z-index-header` | 100 |
| `$z-index-tab-bar` | 100 |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en card-accounts (#1) | Detalle de cuenta (account-detail) |
| Tap en card-accounts (#2) | Detalle de cuenta (account-detail) |
| Tap en tab "Home" | Dashboard (pantalla actual - estado activo) |
| Tap en tab "Pagos" | Pantalla de pagos (payments) |
| Tap en tab "Transferencias" | Pantalla de transferencias (transfers) |
| Tap en tab "Más" | Menú de opciones adicionales (more-options) |
| Tap en navigation-header (acción izquierda) | Perfil de usuario o menú lateral |
| Tap en navigation-header (acción derecha) | Notificaciones |
| Tap en chart-sparkline | Detalle de evolución del balance (balance-history) |
| Tap en amount-display | Toggle visibilidad del saldo |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001 | El amount-display debe mostrar el saldo consolidado de todas las cuentas del usuario en la moneda principal configurada |
| RN-002 | El chart-sparkline refleja la evolución del balance total en los últimos 30 días por defecto |
| RN-003 | Las card-accounts se renderizan dinámicamente según el número de cuentas asociadas al usuario (mínimo 1, sin máximo definido) |
| RN-004 | Si el usuario no tiene cuentas, se muestra un estado vacío con CTA para vincular una cuenta |
| RN-005 | El saldo puede ocultarse por privacidad mediante interacción con el amount-display (mostrar ****) |
| RN-006 | El navigation-header debe mostrar el nombre o saludo personalizado del usuario autenticado |
| RN-007 | El tab-bar marca como activa la pestaña "Home" en esta pantalla |
| RN-008 | Los datos financieros deben actualizarse al hacer pull-to-refresh en la zona de contenido scrollable |
| RN-009 | El orden de las card-accounts sigue la prioridad: cuenta principal primero, luego por fecha de creación descendente |
| RN-010 | El chart-sparkline muestra indicador de tendencia positiva (verde) o negativa (rojo) según la variación del período |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header | `170:2653` | Fijo en la parte superior. Contiene título/saludo, avatar y acceso a notificaciones |
| amount-display | `185:3906` | Saldo consolidado principal. Soporta toggle de visibilidad |
| chart-sparkline | `137:1746` | Gráfico de tendencia del balance. Período por defecto: 30 días |
| card-accounts | `307:1164` | Tarjeta de cuenta bancaria (instancia 1). Navegable al detalle |
| card-accounts | `307:1164` | Tarjeta de cuenta bancaria (instancia 2). Navegable al detalle |
| tab-bar | `185:3900` | Navegación global inferior. Tab "Home" activo en este contexto |