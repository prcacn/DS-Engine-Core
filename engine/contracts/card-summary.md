# card-summary

## Node ID en Figma
185:3909

## Component Set ID
185:3918

## Descripción
Tarjeta grande de resumen financiero. Muestra el saldo total de una cuenta o posición global, la variación porcentual y un acceso rápido a los movimientos. Diseñada para el bloque principal del dashboard (L0).

---

## Propiedades

| Propiedad | Tipo | Default |
|---|---|---|
| `account-label` | TEXT | Cuenta corriente |
| `amount` | TEXT | €24.850,00 |
| `variation` | TEXT | +2,4% |
| `updated-at` | TEXT | Actualizado hoy |
| `cta` | TEXT | Ver movimientos → |

---

## Cuándo usarlo
- Bloque principal del dashboard para mostrar posición global o saldo de cuenta
- Cuando se necesita destacar una cifra económica con su variación
- Siempre que el brief pida "resumen de cartera", "saldo total" o "posición global"

## Cuándo NO usarlo
- En pantallas de listado — usar card-item/financial
- Más de 2 card-summary por pantalla (genera ruido visual)
- En formularios o pantallas de confirmación

---

## Restricciones
- Máximo 2 por pantalla
- Solo en contextos financieros — no usar en pantallas genéricas
- Siempre mostrar la variación con color semántico (verde positivo, rojo negativo)

---

## Uso en patrones

| Patrón | Posición | Repeticiones |
|---|---|---|
| `dashboard` | Tras navigation-header | ×1-2 |
