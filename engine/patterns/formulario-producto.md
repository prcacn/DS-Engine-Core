# formulario-producto
## Descripción
Pantalla de contratación, configuración o solicitud de un producto financiero.
Combina captura de datos con información regulatoria y confirmación.

## Cuándo aplicar este pattern
- Contratar un fondo de inversión
- Solicitar una tarjeta de crédito o débito
- Abrir una cuenta nueva
- Configurar un depósito o plan de ahorro
- Solicitar un préstamo o hipoteca

## Nivel de navegación
L2 — se accede desde detalle de producto o dashboard

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2)
2. notification-banner — variant: info | información regulatoria o condiciones clave
3. input-text × N — campos específicos del producto
4. button-primary — label descriptivo: "Contratar", "Solicitar", "Confirmar"

## Componentes opcionales
- card-item — para mostrar resumen del producto antes de confirmar
- button-secondary — label: "Ver condiciones" / "Cancelar"
- modal-bottom-sheet — confirmación final antes de ejecutar (casi siempre requerido)
- notification-banner — variant: warning | si hay restricciones de acceso o riesgo

## Reglas de composición
- notification-banner regulatorio siempre después del header y antes de los campos
- Si hay modal-bottom-sheet de confirmación, el button-primary lo abre (no envía directamente)
- card-item de resumen va entre los campos y el button-primary

## Reglas de contenido
- La notification-banner debe citar la normativa o condición específica, no ser genérica
- button-primary.label es la acción financiera concreta ("Contratar fondo", "Solicitar tarjeta")
- Si hay riesgo alto, añadir disclaimer en helper_text del último input

## Incompatibilidades
- No usar filter-bar
- No usar tab-bar (L2)

## Composition pattern
Usa: composition-patterns/form-block.md

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
