# Template: Lista de fondos de inversión

**Nivel de navegación:** L1
**Intent:** lista-con-filtros
**Keywords:** fondos, inversión, cartera, lista fondos, mis fondos
**Estado:** aprobado
**Score mínimo requerido:** 80

## DESCRIPCIÓN
Pantalla base aprobada para listado de fondos de inversión. Usar como punto de partida
para cualquier brief que pida ver fondos, cartera o productos de inversión.

## COMPONENTES REQUERIDOS

| Orden | Componente | Node ID | Variante | Notas |
|---|---|---|---|---|
| 1 | navigation-header | `1:3` | default | title: "Fondos" |
| 2 | filter-bar | `1:24` | chips | Todos · Renta fija · Variable · Mixtos |
| 3 | card-item/financial | `137:1758` | default | ×5 — nombre fondo, categoría, rentabilidad |
| 4 | empty-state | `1:31` | no-results | CONDICIONAL — solo si no hay fondos |

## RESTRICCIONES
- tab-bar no incluido — este template es L1, el tab-bar se gestiona a nivel de app shell
- empty-state y card-item/financial son mutuamente excluyentes
- filter-bar siempre incluye "Todos" como primera opción
