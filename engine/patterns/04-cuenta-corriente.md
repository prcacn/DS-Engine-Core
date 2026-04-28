# Pantalla 04 · Cuenta Corriente — Detalle

**Patrón:** `detalle`
**Intent type:** `detalle`

## Brief

Pantalla de detalle de la cuenta corriente del usuario. Muestra el saldo actual, el IBAN completo y el listado de últimos movimientos agrupados por fecha. Permite filtrar por tipo de movimiento. El usuario llega desde el dashboard pulsando sobre la tarjeta de cuenta corriente.

## Componentes requeridos

- `navigation-header` — variante: `back` · title: `Cuenta Corriente`
- `card-item` — variante: `expanded` · muestra saldo total, IBAN completo y titular · es el componente hero de la pantalla
- `list-header` — variante: `default` · title: `Últimos movimientos` · action_label: `Filtrar`
- `card-item` — variante: `default` · × N — uno por cada movimiento · con fecha, concepto e importe

## Componentes opcionales

- `filter-bar` — variante: `chips` · filters: `Todos`, `Ingresos`, `Gastos`, `Recibos`
- `badge` — variante: `positive` · label: `Ingreso` · en movimientos de entrada
- `badge` — variante: `negative` · label: `Gasto` · en movimientos de salida
- `tab-bar` — variante: `default` · tabs: `Inicio`, `Movimientos`, `Transferir`, `Más` · mismo estado que en dashboard
- `button-primary` — variante: `default` · label: `Nueva transferencia`
- `empty-state` — variante: `no-results` · title: `Sin movimientos` · description: `No hay movimientos para el filtro seleccionado.` · solo si el filtro activo no devuelve resultados
- `notification-banner` — variante: `info` · message: `Tu extracto de abril está disponible.` · si hay documento nuevo

## Componentes incompatibles

- `modal-bottom-sheet` — no aplica en pantalla de detalle de cuenta
- `input-text` — no aplica en esta pantalla

## Reglas KB aplicadas

- En España: mostrar IBAN completo en formato ES76 **** **** **** 4821 — nunca oculto en pantalla de detalle de cuenta
- Los movimientos deben agruparse por fecha con un `list-header` colapsable por grupo
- Los importes negativos (gastos) se muestran en rojo · los positivos en verde
- El saldo debe mostrarse con separador de miles y símbolo € al final: `12.450,00 €`
- El `card-item` hero (saldo + IBAN) es `singleton` — solo uno por pantalla
- La pantalla de confirmación de transferencia causó 300 tickets en Q1 sin resumen — regla: si desde esta pantalla se inicia una transferencia, la pantalla de confirmación debe mostrar siempre el IBAN destino y el importe exacto en el botón

## Copy sugerido

- **Header:** `Cuenta Corriente`
- **Card hero:** `Saldo disponible` · `12.450,00 €` · `ES76 2100 0418 4012 3456 4821` · `Pablo Reguera García`
- **Sección movimientos:** `Últimos movimientos`
- **Movimiento 1:** `Nómina abril` · `+2.800,00 €` · `22 abr` · badge: `Ingreso`
- **Movimiento 2:** `Mercadona` · `−87,40 €` · `21 abr` · badge: `Gasto`
- **Movimiento 3:** `Recibo Luz` · `−94,20 €` · `20 abr` · badge: `Recibo`
- **Movimiento 4:** `Bizum · María G.` · `+50,00 €` · `19 abr` · badge: `Ingreso`
- **CTA:** `Nueva transferencia`

## Contexto

- Geografía: España
- Dominio: banca retail
- Perfil de usuario: usuario autenticado, titular de la cuenta
- Estado de sesión: autenticado
- Pantalla origen: Dashboard → tap en card Cuenta Corriente
