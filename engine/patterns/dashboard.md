# dashboard

## Descripción
Pantalla de inicio autenticada (L0) con resumen de la posición global del usuario, accesos rápidos y actividad reciente. Es siempre la raíz de la aplicación — el punto de entrada tras el login.

## Cuándo aplicar este pattern
- Home de la aplicación tras autenticación
- Vista resumen de cartera o posición financiera global
- Panel de control con KPIs y accesos directos a acciones frecuentes

## Componentes requeridos (en este orden)
1. navigation-header — variant: default (L0 — sin back, icono de campana opcional)
2. tab-bar — SIEMPRE presente en L0. sticky en la parte inferior
3. card-item × N — mínimo 1. Muestra la posición o producto principal. En dominio fintech usar card-item/financial

## Componentes opcionales
- list-header — para separar secciones ("Tu posición", "Actividad reciente")
- card-accounts — para mostrar cuentas bancarias del usuario con saldo. Usar cuando el brief mencione cuentas, saldo o banca personal
- movements-set — para mostrar movimientos agrupados por fecha. Usar cuando el brief mencione movimientos, transacciones, historial o actividad reciente
- notification-banner — alertas activas, variant: info o warning. Máximo 1
- button-primary — acción principal del dashboard ("Añadir fondos", "Nueva transferencia")
- badge — indicadores de estado en cards
- skeleton-loader — estado de carga inicial antes de tener datos reales

## Reglas de composición
- navigation-header siempre primer elemento, sin variante back ni close
- tab-bar es OBLIGATORIO — el dashboard es L0 por definición
- Máximo 1 notification-banner por pantalla
- Si dominio es fintech (fondos, cartera, saldo, transferencias), usar card-item/financial
- Si el brief menciona cuentas bancarias o saldo personal, usar card-accounts en lugar de o además de card-item/financial
- Si el brief menciona movimientos, historial o actividad reciente, usar movements-set en lugar de card-item/financial sueltos
- No usar filter-bar — la exploración se gestiona con list-header y secciones
- No usar input-text — el dashboard no tiene formularios
- No usar modal-bottom-sheet — los modales son L3, incompatibles con L0

## Reglas de contenido
- El título del navigation-header debe ser el nombre de la app o estar vacío (no el dominio)
- list-header debe usar labels orientados al usuario: "Tu posición", "Actividad reciente"
- card-item en el dashboard muestra el resumen — no el detalle completo
- card-accounts muestra siempre: initials, nombre de cuenta, número enmascarado y saldo
- movements-set agrupa los movimientos por fecha con header_title (Hoy, Ayer) y lista de card-item/financial

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- filter-bar (L0 no filtra, tiene secciones)
- input-text (no hay formularios en el dashboard)
- modal-bottom-sheet (incompatible con L0)
- empty-state (si no hay datos usar skeleton-loader o notification-banner informativo)
