# card-accounts

## Node ID en Figma
307:1164

## Component Set ID
307:1164

## Descripción
Selector visual de cuentas bancarias. Muestra las cuentas del usuario como cards horizontales en un carrusel o grid, cada una con el nombre del banco, las iniciales, el número enmascarado y el saldo disponible. Se usa en el dashboard y en flujos de selección de cuenta origen.

---

## Variantes

| Nombre | Node ID | Dimensiones | Uso |
|---|---|---|---|
| `default` | `307:1164` | 210×237px | Bloque estándar de cuenta con icono, nombre, número y saldo |

---

## Estructura visual
```
210px · 237px
┌─────────────────────────────┐
│ ←16px                16px→ │
│  [bank-icon / initials]    │  48px circulo
│                             │
│  [bank-name]               │  14px SemiBold
│  [account-number]          │  12px · enmascarado
│                             │
│  [balance-label]           │  11px · neutral
│  [balance-amount]          │  20px · Bold
└─────────────────────────────┘
```
- Fondo: `Background/Default/Default` → `#FFFFFF`
- Border: `Border/Default/Default` → `#E2E8F0`
- Layout: VERTICAL · padding 16px · gap 8px · radius 12px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `bank-name` | TEXT | `Banco Santander` | Sí |
| `account-number` | TEXT | `•••• •••• 4821` | Sí |
| `balance-label` | TEXT | `Saldo disponible` | Sí |
| `balance-amount` | TEXT | `€12.340,00` | Sí |
| `initials` | TEXT | `B` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | VERTICAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 16px → `Spacing/Padding/Vertical/MD` |
| gap | 8px → `Spacing/Gap/MD` |
| borderRadius | 12px → `Spacing/Radius/Component/MD` |
| width | 210px |
| height | 237px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Border | `Border/Default/Default` | `#E2E8F0` |
| Iniciales fondo | `Background/Brand/Subtle` | brand/100 |
| Iniciales texto | `Text/Brand/Default` | brand/700 |
| Bank name | `Text/Default/Default` | `rgb(15,23,42)` |
| Account number | `Text/Neutral/Default` | `rgb(100,116,139)` |
| Balance label | `Text/Neutral/Secondary` | neutral/500 |
| Balance amount | `Text/Default/Default` | `rgb(15,23,42)` |
| Radio | `Spacing/Radius/Component/MD` | `12px` |

---

## Cuándo usarlo
- Selector de cuenta origen en flujos de transferencia
- Bloque de cuentas en el dashboard para mostrar todas las cuentas del usuario
- Pantalla de productos bancarios del cliente

## Cuándo NO usarlo
- Para mostrar movimientos o transacciones — usar `card-item/financial`
- Para mostrar un solo dato de cuenta — usar `card-item/account`
- En formularios sin contexto de selección de cuenta
- Más de 4 cuentas en vista compacta — paginar o usar listado `card-item/account`

---

## Restricciones
- El número de cuenta SIEMPRE enmascarado (solo últimos 4 dígitos visibles)
- Máximo 4 instancias visibles simultáneamente en carrusel
- Solo en contextos de selección o resumen de cuentas bancarias
- Las iniciales se generan automáticamente del nombre del banco si no se especifican

---

## Uso en patrones

| Patrón | Posición | Repeticiones |
|---|---|---|
| `dashboard` | Tras navigation-header | ×1-4 (carrusel) |
| `formulario-simple` | Selector de cuenta origen | ×N (cuentas del usuario) |
| `perfil-usuario` | Sección productos | ×1-4 |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Número de cuenta completo visible | Sin enmascarar | Mostrar solo últimos 4 dígitos precedidos de `•••• ` |
| card-accounts para una sola cuenta | Componente sobredimensionado | Usar `card-item/account` para listados con 1 cuenta |
| card-accounts en pantalla de detalle | Contexto incorrecto | Reservar para dashboard y flujos de selección |
