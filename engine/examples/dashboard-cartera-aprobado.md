# Dashboard de banca personal
**pattern:** dashboard
**status:** APPROVED
**score:** 0.90
**domain:** finanzas, banca personal
**fecha:** 2026-04-15
**figma_node:** 311:1008

## Descripción
Pantalla de inicio autenticada con saldo global, evolución temporal, listado de cuentas bancarias y movimientos recientes agrupados por fecha. Estructura validada desde el DS Simple (Figma node 311:1008).

## Componentes
- navigation-header (variant: default, title: "Posición Global")
- amount-display (label: "Saldo disponible", amount: "14.123,00", currency: "€", sublabel: "+€120,00 este mes")
- chart-sparkline (trend: positive)
- card-accounts (initials: "CC", title: "Cuenta corriente", account_number: "•••• •••• 4821", balance: "1.250,00 €")
- card-accounts (initials: "CA", title: "Cuenta Ahorro", account_number: "•••• •••• 4821", balance: "14.456,23 €")
- movements-set (header_title: "Hoy", header_date: "10 Abr. 2026", items: card-item/financial ×3)
- tab-bar (variant: default)

## Notas de aprobación
Actualizado el 2026-04-15. Estructura extraída directamente del frame Dashboard en Figma Simple DS.
Incluye amount-display + chart-sparkline como elementos hero, card-accounts para cuentas y movements-set para historial.
Tab-bar obligatorio por ser L0.
