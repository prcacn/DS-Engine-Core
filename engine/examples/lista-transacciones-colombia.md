# Lista / Transacciones Colombia
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.88
**domain:** transacciones
**fecha:** 2026-04-13
**nav_level:** L2
**match_keywords:** transacciones Colombia, movimientos Colombia, historial Colombia, transferencias Colombia, pesos colombianos, COP, mercado colombiano, cuenta Colombia, operaciones Colombia

## Descripción
Lista de transacciones adaptada para el mercado colombiano. Sin campo IBAN — usa formato de cuenta local. Los valores se muestran en pesos colombianos (COP). Incluye notification-banner informativo con aviso de normativa SFC. Referencia para cualquier lista de movimientos en Colombia.

## Slots

### header
- navigation-header (variant: Type=Back, title: "Movimientos")
  - ai_overridable: title

### content
- notification-banner (variant: info)
  - ai_overridable: title, description
  - default_props: { title: "Operaciones en Colombia", description: "Los valores se muestran en pesos colombianos (COP) conforme a la normativa SFC." }
- filter-bar (variant: chips)
  - ai_overridable: filters
- list-header (variant: default, title: "Recientes")
  - ai_overridable: title
- card-item (variant: default, title: "Transferencia recibida", subtitle: "Cuenta: 123-456789-00", value: "+$2.500.000 COP", show_chevron: true)
  - ai_overridable: title, subtitle, value
- card-item (variant: default, title: "Pago servicios", subtitle: "Cuenta: 987-654321-00", value: "−$180.000 COP", show_chevron: true)
  - ai_overridable: title, subtitle, value
- card-item (variant: default, title: "Transferencia enviada", subtitle: "Cuenta: 456-789012-00", value: "−$500.000 COP", show_chevron: true)
  - ai_overridable: title, subtitle, value

### bottom

## Componentes
- navigation-header (variant: Type=Back, title: "Movimientos")
- notification-banner (variant: info)
- filter-bar (variant: chips)
- list-header (variant: default, title: "Recientes")
- card-item (variant: default, title: "Transferencia recibida")
- card-item (variant: default, title: "Pago servicios")
- card-item (variant: default, title: "Transferencia enviada")

## Notas de aprobación
En Colombia nunca mostrar campo IBAN — usar número de cuenta local (formato NNN-NNNNNN-NN). Los importes siempre en COP con separador de miles con punto (2.500.000). El notification-banner info con referencia a SFC es obligatorio en pantallas financieras para el mercado colombiano. No usar formato europeo de moneda (€) en ningún campo.
