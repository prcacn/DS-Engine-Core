# card-item/account

## Node ID en Figma
185:3928

## Component Set ID
185:3928

## Descripción
Fila de cuenta bancaria. Muestra el icono/iniciales del banco, nombre de la cuenta, número enmascarado y saldo disponible. Variante específica de card-item para listados de cuentas.

---

## Propiedades

| Propiedad | Tipo | Default |
|---|---|---|
| `account-name` | TEXT | Cuenta corriente |
| `account-number` | TEXT | •••• •••• 4821 |
| `balance` | TEXT | €12.340,00 |
| `account-type` | TEXT | Principal |
| `initials` | TEXT | B |

---

## Cuándo usarlo
- Listados de cuentas del usuario
- Selector de cuenta origen en transferencias
- Vista de productos bancarios del cliente

## Cuándo NO usarlo
- Para transacciones o movimientos — usar card-item/financial
- Para fondos de inversión — usar card-item/financial
- Cuando no hay información de cuenta bancaria

---

## Restricciones
- El número de cuenta siempre enmascarado (últimos 4 dígitos visibles)
- Solo en dominio bancario/cuentas
- Repetible sin límite máximo

---

## Uso en patrones

| Patrón | Variante | Repeticiones |
|---|---|---|
| `lista-con-filtros` | account | N (cuentas del usuario) |
| `formulario-simple` | account | selector origen transferencia |
| `perfil-usuario` | account | lista de productos |
