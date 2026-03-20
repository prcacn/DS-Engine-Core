# Template: Detalle de Fondo — Acción (L2)

## IDENTIFICACIÓN
- **Template ID:** detalle-fondo-L2
- **Nivel de navegación:** L2
- **Intent:** detalle
- **Keywords:** detalle de fondo, ficha de fondo, información del fondo, detalle de inversión, ver fondo, fondo de inversión detalle
- **Score mínimo requerido:** 80%
- **Estado:** aprobado

## DESCRIPCIÓN
Pantalla L2 de detalle de un fondo de inversión. Accesible desde la lista de fondos L1. Muestra la información completa del producto y permite al usuario iniciar la operación de compra. Siempre tiene botón de volver.

## REGLAS DE NIVEL L2
- `navigation-header` obligatorio con botón de volver (`variant: with-back`)
- Sin `tab-bar` — la navegación principal no es visible en L2
- Siempre tiene un CTA principal para la acción disponible
- Puede contener `modal-bottom-sheet` para acciones secundarias o confirmaciones rápidas

## COMPONENTES REQUERIDOS (ORDEN EXACTO — NO CAMBIAR)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header | `1:3` | with-back | Con botón de volver. Título: nombre del fondo |
| 1 | amount-display | `137:1740` | default | Valor liquidativo o rentabilidad acumulada |
| 2 | chart-sparkline | `137:1746` | default | Evolución del fondo (últimos 12 meses) |
| 3 | list-header | `20:797` | default | "Información del producto" |
| 4 | card-item | `1:13` | default | Datos clave: ISIN, categoría, riesgo, gestora (×3-4) |
| 5 | button-primary | `1:9` | default | CTA principal: "Contratar fondo" o "Añadir aportación" |

## COMPONENTES OPCIONALES

| Componente | Cuándo incluirlo |
|---|---|
| `notification-banner` | Aviso regulatorio CNMV/CNBV obligatorio en pantallas de inversión |
| `badge` | Indicador de nivel de riesgo junto al nombre |
| `modal-bottom-sheet` | Para confirmar inicio de contratación antes de ir a L3 |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding horizontal | 16px |
| Padding top | 0px |
| Padding bottom | 16px |
| Fondo | color-background-primary |
| Ancho | 390px |
| Alto | 844px |

## NAVEGACIÓN

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en botón de volver | Lista de fondos | → L1 |
| Tap en button-primary | Formulario de contratación | → L2 (nuevo) |
| Tap en modal-bottom-sheet CTA | Confirmación | → L3 |

## RESTRICCIONES

- `navigation-header` SIEMPRE con `variant: with-back`
- NO incluir `tab-bar`
- `button-primary` siempre al final, fuera del scroll si es posible
- `notification-banner` con aviso CNMV obligatorio en España (normativa KB)
- No mostrar datos de rentabilidad sin el aviso regulatorio visible
