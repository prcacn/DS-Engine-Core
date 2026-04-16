# Dashboard de inicio
**pattern:** dashboard
**status:** APPROVED
**score:** 0.97
**domain:** finanzas
**fecha:** 2026-04-16
**nav_level:** L0
**figma_node:** 353:399
**figma_file:** aMiE3zUmsF6QtqycDarsqi

## Descripcion
Pantalla de inicio autenticada (L0). Estructura verificada directamente desde Figma
node 353:399 (Simple DS). Composicion exacta: navigation-header, amount-display,
chart-sparkline, notification-banner opcional, dos card-accounts en grid horizontal,
movements-set y tab-bar sticky.

## Estructura verificada en Figma (node 353:399)
Orden y dimensiones reales extraidos con Desktop Bridge:
1. navigation-header  — nodeId 1:3    — 390x56   — y:0
2. amount-display     — nodeId 179:3469 — 358x126  — y:68  (margin 16px)
3. chart-sparkline    — nodeId 137:1746 — 358x80   — y:202 (margin 16px)
4. notification-banner — nodeId 20:802 — 390x64   — y:290 (fullWidth)
5. card-accounts x2   — nodeId 307:1164 — 175x237 cada una — grid HORIZONTAL gap:8 — y:362 (margin 16px)
6. movements-set      — nodeId 307:1165 — 358x304  — y:599 (margin 16px)
7. tab-bar            — nodeId 20:784  — 390x56   — y:788 (sticky bottom)

## Componentes
- navigation-header (variant: default, node_id: 1:3, props: {title: "Buenos dias, Ana", subtitle: "Tu resumen financiero de hoy"})
- amount-display (variant: default, node_id: 179:3469, props: {label: "Saldo total disponible", amount: "12.450,00", currency: "EUR", sublabel: "+2,4% este mes"})
- chart-sparkline (variant: default, node_id: 137:1746)
- notification-banner (variant: info, node_id: 20:802, props: {title: "Nueva notificacion", message: "Tu operacion se ha procesado"})
- card-accounts (variant: default, node_id: 307:1164, layout: grid-col-1, props: {account-name: "Cuenta corriente", balance: "8.230,00 EUR"})
- card-accounts (variant: default, node_id: 307:1164, layout: grid-col-2, props: {account-name: "Cuenta ahorro", balance: "4.220,00 EUR"})
- movements-set (variant: default, node_id: 307:1165, props: {header_title: "Hoy", header_date: "16 Abr. 2026"})
- tab-bar (variant: default, node_id: 20:784, props: {active: "Inicio"})

## Reglas aplicadas
- card-accounts usa layout grid-horizontal: dos columnas de 175px con gap 8px dentro de frame 358x237
- movements-set es SINGLETON: solo una instancia por pantalla
- notification-banner es OPCIONAL: incluir solo si hay alertas activas
- tab-bar OBLIGATORIO en L0, sticky en y:788
- amount-display y chart-sparkline siempre juntos en ese orden
- No usar card-item sueltos: los movimientos van dentro de movements-set

## Notas de aprobacion
Estructura extraida directamente de Figma node 353:399 via Desktop Bridge el 2026-04-16.
Fuente de verdad para el patron dashboard. Cualquier discrepancia debe resolverse
comparando contra este node en Figma, no contra versiones anteriores del ejemplo.
