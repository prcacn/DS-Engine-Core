# dashboard

## Descripción
Pantalla de inicio autenticada (L0). Muestra el saldo global del usuario, evolución temporal, sus cuentas bancarias y los últimos movimientos agrupados por fecha. Es siempre la raíz de la aplicación tras el login.

## Cuándo aplicar este pattern
- Home de la aplicación tras autenticación
- Vista resumen de posición financiera global del usuario
- Panel de inicio con saldo, cuentas y actividad reciente

## Estructura real (del DS Simple — node 311:1008)
La composición exacta del dashboard aprobado en Figma es:
1. navigation-header — título del contexto (ej: "Posición Global"), sin back
2. amount-display — saldo total disponible con etiqueta y variación mensual
3. chart-sparkline — gráfico de evolución del saldo
4. card-accounts × N — tarjetas de cuentas del usuario (una por cuenta)
5. movements-set — bloque de movimientos recientes agrupados por fecha
6. tab-bar — navegación global, SIEMPRE en L0, sticky en la parte inferior

## Componentes requeridos (en este orden)
1. navigation-header — variant: default, sin back ni close
2. amount-display — saldo total. Label: "Saldo disponible". Sublabel: variación mensual
3. chart-sparkline — evolución del saldo. Siempre tras amount-display
4. card-accounts — mínimo 1, una por cuenta bancaria del usuario
5. movements-set — mínimo 1, agrupa movimientos recientes por fecha
6. tab-bar — OBLIGATORIO en L0, sticky inferior

## Componentes opcionales
- notification-banner — alertas activas, variant: info o warning. Máximo 1
- button-primary — acción principal ("Nueva transferencia", "Añadir cuenta")
- list-header — separador de secciones ("Tus cuentas", "Últimos movimientos")

## Reglas de composición
- navigation-header siempre primer elemento
- amount-display y chart-sparkline van siempre juntos y en ese orden
- card-accounts lista todas las cuentas del usuario, una por tarjeta
- movements-set muestra los movimientos más recientes agrupados por día (Hoy, Ayer)
- tab-bar es OBLIGATORIO en L0 — el dashboard es siempre L0
- Máximo 1 notification-banner por pantalla
- No usar filter-bar — la exploración se gestiona con secciones
- No usar input-text — el dashboard no tiene formularios
- No usar modal-bottom-sheet — los modales son L3, incompatibles con L0

## Reglas de contenido
- navigation-header title: nombre del contexto ("Posición Global", "Mi Banca")
- amount-display label siempre descriptiva: "Saldo disponible", "Saldo total"
- card-accounts muestra initials, nombre de cuenta, número enmascarado y saldo
- movements-set header_title relativo cuando posible: "Hoy", "Ayer"
- Los movimientos dentro de movements-set usan card-item/financial

## Incompatibilidades
- filter-bar (L0 no filtra)
- input-text (no hay formularios en el dashboard)
- modal-bottom-sheet (incompatible con L0)
- empty-state (si no hay datos usar skeleton-loader o notification-banner)
- card-item/financial sueltos (usar movements-set como contenedor)
