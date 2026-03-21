# global-rules / singleton-rules.md
# Reglas Globales de Singletons

> Componentes que solo pueden aparecer **una vez por pantalla**, independientemente
> del patrón o del brief. El engine elimina automáticamente los duplicados.
> Estas reglas se aplican como última validación antes de devolver la composición.

---

## 1. Componentes singleton estrictos

| Componente | Máx. por pantalla | Qué hacer si hay duplicado |
|---|---|---|
| `navigation-header` | 1 | Mantener el primero, eliminar el resto |
| `filter-bar` | 1 | Mantener el primero, eliminar el resto |
| `tab-bar` | 1 | Mantener el primero, eliminar el resto |
| `modal-bottom-sheet` | 1 | Mantener el primero, eliminar el resto |
| `empty-state` | 1 | Mantener el primero, eliminar el resto |
| `notification-banner` | 1 (salvo patrón notificaciones) | Mantener el de mayor prioridad |

---

## 2. Componentes con límite flexible

| Componente | Límite | Condición |
|---|---|---|
| `list-header` | máx. 3 | Cada uno precede a un grupo distinto de card-items |
| `badge` | máx. 3 | Solo como elemento auxiliar dentro de card-item |
| `notification-banner` | máx. 5 | Solo en patrón `notificaciones` |
| `button-primary` | máx. 1 visible | No puede haber dos button-primary visibles simultáneamente |

---

## 3. Incompatibilidades absolutas

Pares de componentes que **nunca pueden coexistir** en la misma pantalla:

| Componente A | Componente B | Motivo |
|---|---|---|
| `card-item` | `empty-state` | Son mutuamente excluyentes en el área de lista |
| `filter-bar` | `input-text` | No mezclar búsqueda avanzada con filtros por chips |
| `tab-bar` | `modal-bottom-sheet` | El modal ocupa el espacio del tab-bar |

---

## 4. Reglas de orden

El orden de los componentes en el array de composición siempre respeta esta jerarquía:

1. `navigation-header` — siempre primero (order: 0)
2. `notification-banner` — inmediatamente después del header si existe
3. `filter-bar` — después del header o banner
4. `list-header` — precede a su grupo de card-items
5. `card-item` / `empty-state` — contenido principal
6. `button-primary` — siempre al final, antes del tab-bar
7. `button-secondary` — junto al button-primary si existe
8. `modal-bottom-sheet` — overlay, se renderiza al final del DOM
9. `tab-bar` — siempre el último elemento (solo en L0/L1)

---

## Referencias
- Reglas de navegación: `engine/global-rules/navigation.md`
- Contratos individuales: `engine/contracts/`
