# Dashboard de inicio
**pattern:** dashboard
**status:** APPROVED
**score:** 0.92
**domain:** finanzas
**fecha:** 2026-03-23
**nav_level:** L0

## Descripción
Pantalla de inicio autenticada (L0). Muestra saldo total, gráfica de evolución,
secciones de cuentas y actividad reciente. Tab-bar siempre visible.

## Componentes
- navigation-header (variant: Type=Dashboard, sin título)
- amount-display (saldo total con variación)
- chart-sparkline (gráfica de evolución mensual)
- list-header (title: "Sección", action_label: "Ver todo")
- card-item/account ×2 (cuentas con saldo enmascarado)
- list-header (title: "Sección", action_label: "Ver todo")
- card-item/financial ×3 (actividad reciente)
- tab-bar (variant: default, tabs: ["Inicio","Mercado","Cartera","Perfil"])

## Notas de aprobación
Aprobada como pantalla base de dashboard financiero. Usar como base para variantes geográficas.
