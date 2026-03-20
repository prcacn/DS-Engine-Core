# Template: Dashboard de cartera

**Nivel de navegación:** L0
**Intent:** dashboard
**Keywords:** dashboard, inicio, home, cartera, mi cartera, posición, pantalla principal
**Estado:** aprobado
**Score mínimo requerido:** 80

## DESCRIPCIÓN
Pantalla de inicio autenticada. Siempre L0 — siempre lleva tab-bar.
Base para cualquier brief que pida home, dashboard o pantalla principal.

## COMPONENTES REQUERIDOS

| Orden | Componente | Node ID | Variante | Notas |
|---|---|---|---|---|
| 1 | navigation-header | `1:3` | default | title: "Mi cartera" |
| 2 | list-header | `20:797` | default | title: "Tu posición" |
| 3 | card-item/financial | `137:1758` | default | ×3 — productos principales |
| 4 | list-header | `20:797` | default | title: "Actividad reciente" |
| 5 | card-item/financial | `137:1758` | default | ×2 — últimas operaciones |
| 6 | tab-bar | `20:784` | default | sticky bottom — obligatorio en L0 |

## RESTRICCIONES
- tab-bar SIEMPRE presente — L0 obligatorio
- navigation-header sin back ni close
- No usar filter-bar en dashboard
