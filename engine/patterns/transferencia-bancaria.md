# transferencia-bancaria

## Descripción
Flujo MULTIPANTALLA de 5 pasos para envío de dinero entre cuentas. Este patrón genera siempre 5 pantallas en orden fijo — ninguna es omitible. La pantalla de revisión es obligatoria por normativa.

## Cuándo aplicar este pattern
- Enviar dinero a otra cuenta
- Transferencia SEPA, CLABE, Bizum
- Pago a tercero
- Mover fondos entre cuentas propias

## Pantallas del flujo (en este orden, siempre las 5)

### Pantalla 1 — Cuenta origen
- navigation-header (variant: with-back, título: "Nueva transferencia")
- input-text (selección de cuenta origen)
- button-primary (label: "Continuar")

### Pantalla 2 — Destino e importe
- navigation-header (variant: with-back, título: "Destino e importe")
- input-text × 2 (IBAN/CLABE, Importe)
- input-text opcional (Concepto)
- button-primary (label: "Revisar transferencia")
- notification-banner opcional (aviso de límite operativo)

### Pantalla 3 — Revisión (OBLIGATORIA por normativa)
- navigation-header (variant: with-back, título: "Revisa tu transferencia")
- card-item × 4 (resumen: origen, destino, importe, concepto — readonly)
- button-primary (label: "Confirmar transferencia")
- button-secondary (label: "Modificar")

### Pantalla 4 — Confirmación (punto de no retorno)
- navigation-header (variant: with-back)
- modal-bottom-sheet (variant: confirmation)
- card-item × 2 (resumen compacto)
- button-primary (label: "Enviar [importe]€")
- button-secondary (label: "Cancelar")

### Pantalla 5 — Resultado
- navigation-header (variant: close, título: "Transferencia enviada")
- card-item × 3 (confirmación de la operación)
- button-primary (label: "Ir al inicio")
- notification-banner opcional (aviso de plazo)
- button-secondary opcional (label: "Nueva transferencia")

## Reglas de composición
- Las 5 pantallas son obligatorias — nunca omitir ninguna
- La pantalla de revisión (3) es OBLIGATORIA por normativa bancaria
- El label del button-primary en pantalla 4 DEBE incluir el importe real cuando esté disponible
- NUNCA tab-bar en este flujo — es un flujo modal L2/L3

## Reglas de contenido
- Pantalla 3: todos los card-item son readonly (show_chevron: false)
- Pantalla 4: el modal describe claramente que la acción es irreversible
- Pantalla 5: confirmar la operación con número de referencia si está disponible

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- tab-bar (flujo modal, no L0/L1)
- filter-bar
- empty-state
