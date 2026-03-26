# amount-display

## Node ID en Figma
137:1740

## Descripción
Componente de visualización de importe o saldo principal. Muestra el valor económico más relevante de la pantalla con su variación. Es el elemento visual central de dashboards y detalles financieros.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `137:1740` | 390×126px | Saldo principal o valor destacado |

---

## Layout

| Propiedad | Valor |
|---|---|
| width | 390px (fill) |
| height | 126px |

---

## Cuándo usarlo
- Como primer elemento de contenido en dashboards (L0) tras el navigation-header
- En detalles de producto financiero (L2) para mostrar el valor liquidativo
- Cuando el importe es el dato más importante de la pantalla

## Cuándo NO usarlo
- En formularios — usar `input-text` para captura de importes
- En pantallas sin contexto financiero
- Más de 1 por pantalla

---

## Restricciones
- **Máximo 1 por pantalla**
- Los datos sensibles (saldo) deben tener opción de ocultar/mostrar
- Siempre acompañado de su unidad monetaria y el locale correcto
- Formato de moneda según mercado del usuario (KB: `FORMATO DE MONEDA`)

---

## Uso en patrones

| Patrón | Posición | Notas |
|---|---|---|
| `dashboard` | Order 1, tras navigation-header | Saldo principal de la cuenta |
| `detalle` | Order 1, tras navigation-header | Valor liquidativo del fondo |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Saldo siempre visible sin opción de ocultar | Sin eye-button | Añadir control de visibilidad |
| Formato incorrecto de moneda | Sin detección de locale | Aplicar formato según mercado del usuario |