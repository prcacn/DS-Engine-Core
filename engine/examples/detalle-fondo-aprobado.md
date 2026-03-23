# Detalle de fondo de inversión
**pattern:** detalle
**status:** APPROVED
**score:** 0.91
**domain:** fondos
**fecha:** 2026-03-23
**nav_level:** L2

## Descripción
Pantalla de detalle de un fondo específico (L2). Muestra datos completos
del fondo: rentabilidad histórica, riesgo, horizonte y aviso legal CNMV.

## Componentes
- navigation-header (variant: Type=Modal, title: "Detalle del fondo")
- notification-banner (variant: warning, message: "Aviso CNMV — Los productos de inversión conllevan riesgo de pérdida")
- card-item (title: "Rentabilidad 1 año", show_chevron: false)
- card-item (title: "Rentabilidad 3 años", show_chevron: false)
- card-item (title: "Nivel de riesgo", show_chevron: false)
- card-item (title: "Horizonte recomendado", show_chevron: false)
- card-item (title: "Comisión de gestión", show_chevron: false)
- button-primary (variant: default, label: "Contratar fondo")

## Notas de aprobación
Aprobada como pantalla base de detalle de fondo. Contiene todos los campos obligatorios por normativa.
