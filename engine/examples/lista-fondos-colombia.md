# Lista de fondos / Colombia
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.86
**domain:** inversion-colombia
**fecha:** 2026-03-26
**nav_level:** L1
**match_keywords:** Colombia, COP, pesos colombianos, fondo Colombia, inversión Colombia, mercado colombiano, saldo mínimo Colombia

## Descripción
Variante de lista de fondos adaptada para el mercado colombiano. Muestra aviso de saldo mínimo si saldo < 1.000.000 COP. Moneda en COP, regulación de la SFC.

## Slots

### header
- navigation-header (variant: Type=Predeterminada, title: "Mis fondos")
  - ai_overridable: title

### content
- notification-banner (variant: info)
  - ai_overridable: true
  - default_props: { title: "Saldo mínimo", description: "Necesitas al menos $1.000.000 COP para invertir en este fondo" }
- filter-bar (variant: chips)
  - ai_overridable: false
- card-item/financial ×5
  - ai_overridable: true
  - quantity_range: { min: 1, max: 20 }
  - default_props: { currency: "COP" }
- empty-state (variant: default)
  - ai_overridable: false

### bottom
- tab-bar (variant: default)
  - ai_overridable: false

## Componentes
- navigation-header (variant: Type=Predeterminada, title: "Mis fondos")
- notification-banner (variant: info)
- filter-bar (variant: chips)
- card-item/financial
- empty-state
- tab-bar

## Notas de aprobación
El notification-banner de saldo mínimo se muestra condicional — solo si saldo < 1.000.000 COP. La condición la gestiona el front, el engine siempre lo incluye como componente.
