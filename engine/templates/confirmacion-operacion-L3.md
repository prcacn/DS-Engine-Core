# Template: Confirmación de Operación (L3)

## IDENTIFICACIÓN
- **Template ID:** confirmacion-operacion-L3
- **Nivel de navegación:** L3
- **Intent:** confirmacion
- **Keywords:** confirmar operación, confirmación, confirmar transferencia, confirmar compra, confirmar contratación, resumen de operación, paso final
- **Score mínimo requerido:** 80%
- **Estado:** aprobado

## DESCRIPCIÓN
Pantalla L3 de confirmación de cualquier operación financiera. Es el último paso antes de ejecutar una acción irreversible. Siempre muestra un resumen completo de la operación y requiere acción explícita del usuario para proceder. Nunca debe omitirse en flujos destructivos o financieros.

## REGLAS DE NIVEL L3
- `navigation-header` obligatorio con botón de volver o cerrar (`variant: with-back`)
- Sin `tab-bar`
- Siempre muestra resumen completo: importe, origen, destino, comisión
- Siempre tiene CTA primario (confirmar) y secundario (cancelar)
- Es la pantalla de mayor responsabilidad del flujo — nunca simplificar

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `1:3` | with-back | Con botón de volver/cerrar. Título: "Confirmar [acción]" |
| 1 | list-header | `20:797` | default | "Resumen de la operación" |
| 2 | card-item | `1:13` | default | Líneas del resumen: importe, origen, destino, comisión (×3-4) |
| 3 | notification-banner | `20:802` | warning | Aviso legal o de irreversibilidad de la operación |
| 4 | button-primary | `1:9` | default | CTA confirmación: "Confirmar [acción]" — label descriptivo |
| 5 | button-secondary | `1:11` | default | CTA cancelación: "Cancelar" |

## COMPONENTES OPCIONALES

| Componente | Cuándo incluirlo |
|---|---|
| `modal-bottom-sheet` | Para doble confirmación en operaciones de alto importe |
| `amount-display` | Si el importe es el dato más relevante de la confirmación |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding horizontal | 16px |
| Padding top | 0px |
| Padding bottom | 32px |
| Fondo | color-background-primary |
| Ancho | 390px |
| Alto | 844px |

## NAVEGACIÓN

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en botón de volver | Pantalla anterior del flujo | → L2 |
| Tap en button-primary (confirmar) | Pantalla de resultado / éxito | → L3 (resultado) |
| Tap en button-secondary (cancelar) | Dashboard o inicio del flujo | → L0 o L1 |

## RESTRICCIONES

- `navigation-header` SIEMPRE con `variant: with-back`
- NO incluir `tab-bar`
- `button-primary` label SIEMPRE descriptivo: "Confirmar transferencia", nunca "OK" o "Continuar" (regla KB)
- `notification-banner` OBLIGATORIO con aviso de irreversibilidad
- El resumen DEBE mostrar: importe, cuenta origen, cuenta destino y comisión (regla KB — error Q1 2023)
- Datos financieros enmascarados por defecto con opción de revelar (regla KB — seguridad)
