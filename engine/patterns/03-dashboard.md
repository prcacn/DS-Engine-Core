# Pantalla 03 · Dashboard

**Patrón:** `lista-con-filtros`
**Intent type:** `lista-con-filtros`

## Brief

Pantalla principal de la app bancaria tras el login. Muestra el resumen de productos del usuario: cuenta corriente, cuenta de ahorro y tarjeta de crédito. Incluye acceso rápido a las acciones más frecuentes. El usuario está autenticado.

## Componentes requeridos

- `navigation-header` — variante: `default` · title: `Buenos días, Pablo` · sin botón de back · con acción: icono de notificaciones
- `filter-bar` — variante: `chips` · filters: `Todos`, `Cuentas`, `Tarjetas`, `Inversiones`
- `card-item` — variante: `highlighted` · Cuenta Corriente · saldo principal
- `card-item` — variante: `default` · Cuenta Ahorro
- `card-item` — variante: `default` · Tarjeta Visa

## Componentes opcionales

- `list-header` — variante: `default` · title: `Mis productos` · action_label: `Ver todo`
- `notification-banner` — variante: `info` · message: `Tienes 2 recibos pendientes de revisar.` · si hay alertas activas
- `tab-bar` — variante: `default` · tabs: `Inicio`, `Movimientos`, `Transferir`, `Más`
- `badge` — variante: `warning` · label: `Pdte.` · en tarjeta con saldo negativo o alerta
- `button-primary` — variante: `default` · label: `Nueva transferencia`

## Componentes incompatibles

- `modal-bottom-sheet` — no aplica en pantalla principal
- `empty-state` — solo si el usuario no tiene ningún producto contratado

## Reglas KB aplicadas

- En España: mostrar siempre los últimos 4 dígitos del IBAN en las tarjetas de producto — nunca el número completo
- No mostrar módulo de inversiones si el saldo total es inferior a 1.000 € — regla de negocio crítica
- El saldo debe mostrarse con separador de miles y dos decimales: `12.450,00 €`
- `notification-banner` de avisos debe aparecer antes de los `card-item`, nunca debajo
- El `tab-bar` debe ser siempre `singleton` — una sola instancia por pantalla

## Copy sugerido

- **Header:** `Buenos días, Pablo`
- **Sección:** `Mis productos`
- **Card 1:** `Cuenta Corriente` · `ES76 **** 4821` · `12.450,00 €`
- **Card 2:** `Cuenta Ahorro` · `ES91 **** 0034` · `3.200,00 €`
- **Card 3:** `Visa Débito` · `**** 7741` · `Límite: 2.000,00 €`
- **CTA:** `Nueva transferencia`
- **Tabs:** `Inicio` · `Movimientos` · `Transferir` · `Más`

## Contexto

- Geografía: España
- Dominio: banca retail
- Perfil de usuario: usuario autenticado, cliente con varios productos
- Estado de sesión: autenticado
