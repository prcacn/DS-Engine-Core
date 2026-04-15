# card-accounts

## Node ID en Figma
307:1164

## Descripción
Tarjeta de resumen de cuenta bancaria. Muestra el nombre de la cuenta, los últimos dígitos del IBAN/número y el saldo disponible. Se usa en dashboards y pantallas de selección de cuenta.

## Metadata
figma_id: 307:1164

## Cuándo usarlo
- Listado de cuentas del usuario en el dashboard
- Selector de cuenta origen en flujos de transferencia
- Resumen de saldo en pantalla de inicio

## Cuándo NO usarlo
- Detalle completo de cuenta — usar patrón detalle
- Items de movimientos — usar card-item/financial
- Productos de inversión — usar card-item/financial con trend

## Propiedades
| Propiedad | Tipo | Valores | Default |
|---|---|---|---|
| initials | string | — | "CC" |
| title | string | — | "Cuenta corriente" |
| account_number | string | — | "•••• •••• 4821" |
| balance | string | — | "1.250,00 €" |

## Restricciones
- initials debe tener máximo 2 caracteres
- account_number siempre con formato enmascarado (•••• •••• XXXX)
- balance debe incluir siempre símbolo de moneda
- No usar sin los tres campos principales (title, account_number, balance)
