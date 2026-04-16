# Dashboard de inicio
**pattern:** dashboard
**status:** APPROVED
**score:** 0.95
**domain:** finanzas
**fecha:** 2026-04-16
**nav_level:** L0

## Descripcion
Pantalla de inicio autenticada (L0). Muestra saldo total, grafica de evolucion,
tarjetas de cuentas bancarias y actividad reciente agrupada por fecha.
Tab-bar siempre visible y sticky en la parte inferior.

## Componentes
- navigation-header (variant: Type=Dashboard, title: "Buenos dias, Ana", subtitle: "Aqui esta el resumen de tu dinero")
- amount-display (label: "Saldo total disponible", value: "12.450,00 EUR", sublabel: "+2,4% este mes")
- chart-sparkline (variant: default, periodo: "Ene - Mar")
- card-accounts (variant: default, title: "Cuenta corriente", account_number: "**** **** **** 4821", balance: "8.230,00 EUR")
- card-accounts (variant: default, title: "Cuenta ahorro", account_number: "**** **** **** 1193", balance: "4.220,00 EUR")
- movements-set (header_title: "Hoy", items: 3)
- tab-bar (variant: default, tabs: ["Inicio","Cuentas","Mover dinero","Tarjetas","Perfil"], active: "Inicio")

## Reglas aplicadas
- card-accounts x2: una por cuenta bancaria del usuario
- movements-set singleton: un unico bloque de movimientos recientes
- tab-bar obligatorio en L0, sticky inferior
- No usar card-item/financial sueltos: deben ir dentro de movements-set
- No usar list-header entre card-accounts y movements-set salvo que haya seccion explicita

## Notas de aprobacion
Ejemplo base del dashboard financiero. Alineado con patron dashboard v2 y componentes
card-accounts y movements-set del DS Simple (nodes 307:1184 y 307:1185).
Usar como base para variantes geograficas (dashboard/espana, dashboard/mexico).
