# Lista de fondos de inversión
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.91
**domain:** fondos
**fecha:** 2026-03-20

## Descripción
Pantalla de listado de fondos de inversión con filtros por categoría (Todos, Renta fija, Variable, Mixtos).
Aprobada como pantalla base para el módulo de inversión.

## Componentes
- navigation-header (variant: default, title: "Fondos")
- filter-bar (variant: chips)
- card-item/financial ×5 (title: nombre fondo, subtitle: categoría, value: rentabilidad)
- empty-state (CONDICIONAL — si no hay resultados)

## Notas de aprobación
Aprobada el 2026-03-20. Cumple restricciones de card-item/financial en dominio fintech.
La señal PRECEDENT debe mejorar con este ejemplo.
