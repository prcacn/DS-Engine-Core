# Template: Dashboard — Pantalla Principal (L0)

## IDENTIFICACIÓN
- **Template ID:** dashboard-L0
- **Nivel de navegación:** L0
- **Intent:** dashboard
- **Keywords:** dashboard, home, inicio, pantalla principal, pantalla de inicio, resumen de cuenta, vista general, accesos rápidos, mi cartera
- **Score mínimo requerido:** 80%
- **Estado:** aprobado

## DESCRIPCIÓN
Pantalla raíz de la aplicación. Punto de entrada tras el login. Muestra el saldo principal, evolución de cartera, cuentas del usuario y actividad financiera reciente.

**Cuando el diseñador solicite "dashboard" o cualquier keyword de esta lista, el engine pinta EXACTAMENTE esta pantalla — no genera desde cero.**

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header · Type=Dashboard]          56px     │
├─────────────────────────────────────────────────────────┤
│  [amount-display]                              126px    │
│  [chart-sparkline]                              80px    │
│  [list-header] "Tus cuentas"                    44px    │
│  [card-item/account]                            72px    │
│  [card-item/account]                            72px    │
│  [list-header] "Actividad reciente"             44px    │
│  [card-item/financial]                          72px    │
│  [card-item/financial-expense]                  72px    │
│  [card-item/financial]                          72px    │
├─────────────────────────────────────────────────────────┤
│  [tab-bar]                                      56px    │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante Figma | Notas |
|-------|------------|---------|----------------|-------|
| 0 | navigation-header | `170:2660` | Type=Dashboard | Sin título. Menú izquierda, campana derecha |
| 1 | amount-display | `137:1740` | State=Default | Saldo principal |
| 2 | chart-sparkline | `137:1746` | State=Default | Evolución de cartera |
| 3 | list-header | `20:797` | State=Default | label: "Tus cuentas" |
| 4 | card-item/account ×2 | `185:3919` | State=Default | Cuentas del usuario |
| 5 | list-header | `20:797` | State=Default | label: "Actividad reciente" |
| 6 | card-item/financial | `137:1758` | State=Default | Movimiento positivo |
| 7 | card-item/financial-expense | `137:1769` | State=Default | Movimiento negativo |
| 8 | card-item/financial | `137:1758` | State=Default | Movimiento adicional |
| 9 | tab-bar | `20:784` | State=Default | Siempre sticky bottom |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Ancho | 390px |
| Alto | 844px |
| Fondo | #FFFFFF |
| tab-bar | sticky bottom y=788 |

## REGLAS DE NIVEL L0
- navigation-header SIEMPRE Type=Dashboard
- tab-bar SIEMPRE presente y SIEMPRE el último
- No puede contener input-text ni modal-bottom-sheet
- Los list-header separan secciones — no eliminar

## RESTRICCIONES
- Solo puede existir UNA pantalla L0 en el flujo
- navigation-header SIEMPRE Type=Dashboard
- tab-bar siempre presente y siempre sticky bottom
