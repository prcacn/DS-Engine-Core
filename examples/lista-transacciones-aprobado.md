# Lista de transacciones
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.89
**domain:** transacciones
**fecha:** 2026-03-20

## Descripción
Historial de transacciones con filtros por tipo (Todos, Ingresos, Gastos, Transferencias).

## Componentes
- navigation-header (variant: default, title: "Transacciones")
- filter-bar (variant: chips)
- card-item/financial ×8 (cada transacción con importe y fecha)
- empty-state (CONDICIONAL)

## Notas de aprobación
Aprobada el 2026-03-20. Usa card-item/financial por ser dominio fintech.
