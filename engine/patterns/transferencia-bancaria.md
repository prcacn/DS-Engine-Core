# transferencia-bancaria
## Descripción
Flujo MULTIPANTALLA de 4 pasos para envío de dinero entre cuentas.
Pantallas 1 y 2 fusionadas en un único formulario de origen + destino + importe.
La pantalla de revisión (paso 2) es obligatoria por normativa PSD2.

## Cuándo aplicar este pattern
- Enviar dinero a otra cuenta
- Transferencia SEPA, CLABE, Bizum
- Pago a tercero
- Mover fondos entre cuentas propias

## Pantallas del flujo (en este orden, siempre las 4)

### Pantalla 1 — Origen, destino e importe (fusionado)
- navigation-header (variant: Type=Modal, título: "Nueva transferencia")
- list-header (título: "Cuenta de origen", variant: default)
- input-text (variant: select, label: "Cuenta de origen")
- list-header (título: "Destinatario e importe", variant: default)
- input-text (variant: default, label: "IBAN / CLABE", required: true)
- input-text (variant: numeric, label: "Importe", required: true)
- input-text (variant: default, label: "Concepto", required: false)
- button-primary (label: "Revisar transferencia")
- notification-banner opcional (variant: warning, aviso de límite operativo)

## Spacing entre grupos de campos
- Entre list-header y su primer input-text: gap-md (8px)
- Entre input-text consecutivos del mismo grupo: gap-md (8px)
- Entre grupos distintos (list-header nuevo): gap-xl (16px)
- button-primary: posición fija en la parte inferior de la pantalla (sticky bottom)
  según global-rules/navigation.md — nunca entre campos

### Pantalla 2 — Revisión (OBLIGATORIA por normativa PSD2)
- navigation-header (variant: Type=Modal, título: "Revisa tu transferencia")
- list-header (título: "Detalle de la operación", variant: default)
- card-item × 4 (resumen readonly: origen, destino, importe, concepto)
- notification-banner opcional (variant: info, comisión aplicable o "Sin comisión")
- button-primary (label: "Confirmar transferencia")
- button-secondary (label: "Modificar")

## Spacing pantalla 2
- Entre list-header y card-items: gap-md (8px)
- Entre card-items: gap-xs (2px) — son filas de datos, no tarjetas independientes
- notification-banner: gap-xl (16px) sobre el button-primary
- button-primary: sticky bottom — nunca entre los card-items
- button-secondary: gap-md (8px) sobre button-primary

### Pantalla 3 — Confirmación (punto de no retorno)
- navigation-header (variant: Type=Modal, sin título — L3)
- modal-bottom-sheet (variant: confirmation)
- button-primary (label: "Enviar [importe] €")
- button-secondary (label: "Cancelar")

### Pantalla 4 — Resultado
- navigation-header (variant: Type=Modal, título: "Transferencia enviada")
- card-item × 3 (confirmación de la operación — readonly)
- notification-banner opcional (variant: info, aviso de plazo)
- button-primary (label: "Ir al inicio")
- button-secondary opcional (label: "Nueva transferencia")

## Reglas de composición
- Las 4 pantallas son obligatorias — nunca omitir ninguna
- La pantalla de revisión (2) es OBLIGATORIA por normativa PSD2/bancaria
- El label del button-primary en pantalla 3 DEBE incluir el importe real
- NUNCA tab-bar en este flujo — es un flujo modal L2/L3
- button-primary SIEMPRE sticky bottom — nunca flotando entre campos
- Los list-header actúan como separadores visuales de grupos de campos

## Reglas de spacing (basadas en tokens del DS)
- gap-xl = 16px (--gap-xl = --space-7) → entre grupos distintos de campos
- gap-md = 8px  (--gap-md = --space-4) → entre campos del mismo grupo
- gap-xs = 2px  (--gap-xs = --space-1) → entre card-items de resumen (filas de datos)
- Padding horizontal de pantalla: 16px (--grid-margin)
- button-primary: padding-bottom mínimo 24px desde el borde inferior seguro

## Reglas de contenido
- Pantalla 1: el campo IBAN/CLABE muestra helper_text con formato según geografía
- Pantalla 2: todos los card-item son readonly (show_chevron: false)
- Pantalla 2: notification-banner de comisión OBLIGATORIO — si es 0 indicar "Sin comisión"
- Pantalla 3: modal describe claramente que la acción es irreversible
- Pantalla 4: confirmar con número de referencia si está disponible

## Incompatibilidades
- tab-bar (flujo modal L2/L3)
- filter-bar
- empty-state

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
