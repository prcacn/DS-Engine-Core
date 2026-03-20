# skeleton-loader

## Descripción
Estado de carga. Reemplaza a los componentes de contenido mientras se cargan los datos. Respeta la estructura visual del contenido que va a aparecer para minimizar el salto visual al cargar.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `137:1752` | 390×72px | Placeholder de carga para card-item |

---

## Layout

| Propiedad | Valor |
|---|---|
| width | 390px (fill) |
| height | 72px (igual que card-item) |

---

## Cuándo usarlo
- Durante la carga inicial de listados con más de 3 items
- Reemplazando `card-item` mientras llegan los datos
- En el primer render de dashboards con datos remotos

## Cuándo NO usarlo
- Para acciones puntuales (guardar, enviar) — usar spinner dentro del button-primary
- Para errores de carga — usar `notification-banner` + `empty-state`
- Si la carga es instantánea (<200ms)

---

## Restricciones
- Se muestra en el mismo lugar y con las mismas dimensiones que el componente que reemplaza
- Nunca mezclar skeleton con contenido real en el mismo listado
- Desaparece cuando llegan todos los datos, nunca parcialmente

---

## Uso en patrones

| Patrón | Sustituye a | Cuándo |
|---|---|---|
| `lista-con-filtros` | `card-item` × N | Carga inicial del listado |
| `dashboard` | `card-item/financial` × 3 | Carga inicial del home |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Skeleton + contenido real mezclados | Carga parcial | Mostrar todos skeleton o todos datos |
| Spinner global en listado | Tipo de loader incorrecto | Usar skeleton para listas, spinner para acciones |