# Niveles de Navegación — DS IA-Ready

## Definición

| Nivel | Nombre | Descripción | Ejemplos |
|---|---|---|---|
| L0 | Root | Pantalla raíz — punto de entrada tras login. Una sola por app. | dashboard, home |
| L1 | Section | Sección principal — primer nivel de navegación real. Accesible desde tab-bar o menú. | lista de fondos, historial de transferencias, perfil |
| L2 | Detail / Action | Detalle de un item o inicio de una acción. Accesible desde L1. | detalle de fondo, formulario de transferencia, detalle de movimiento |
| L3 | Confirmation / Result | Confirmación o resultado de una acción. Siempre tiene botón de volver o cerrar. | confirmación de transferencia, resultado de operación, error de acción |

## Reglas

- L0 siempre tiene `navigation-header` sin botón de volver y `tab-bar`
- L1 siempre tiene `navigation-header` sin botón de volver (la navegación es el tab-bar)
- L2 siempre tiene `navigation-header` con botón de volver (`variant: with-back`)
- L3 siempre tiene `navigation-header` con botón de volver o cerrar, y un CTA principal
- No se puede saltar de L0 a L3 sin pasar por L2
- Un flujo completo es: L0 → L1 → L2 → L3

## Mapping intent → nivel

| Intent | Nivel |
|---|---|
| dashboard | L0 |
| lista-con-filtros | L1 |
| notificaciones | L1 |
| detalle | L2 |
| formulario-simple | L2 |
| transferencia-bancaria | L2→L3 (flujo) |
| confirmacion | L3 |
| error-estado | L3 |
| onboarding | L0→L1 (flujo) |
| perfil-usuario | L1 |
