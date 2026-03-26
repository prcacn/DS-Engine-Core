# input-text

## Node ID en Figma
1:21

## Component Set ID
185:3896  ← COMPONENT_SET padre (no instanciar directamente)

## Descripción
Campo de entrada de texto. Elemento de formulario para captura de datos del usuario. Incluye label superior y texto de placeholder. Base para todos los campos de formulario.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `1:21` | 358×50px | Campo de formulario genérico |

---

## Estructura visual
```
358px · 50px altura · radius 4px
┌──────────────────────────────────────────┐
│ ←16px                            16px→  │
│  [label "Etiqueta"]  12px DM Sans       │  15px
│  [placeholder "Placeholder o valor"]    │  17px
└──────────────────────────────────────────┘
```
- Fondo: `#FFFFFF` — `Background/Default/Default`
- Layout: VERTICAL · padding H: 16px · padding V: 8px · gap: 2px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `label` | TEXT | `"Etiqueta"` | Sí |
| `placeholder` | TEXT | `"Placeholder o valor"` | Sí |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | VERTICAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 8px → `Spacing/Padding/Vertical/MD` |
| gap | 2px → `Spacing/Gap/XS` |
| borderRadius | 4px → `Spacing/Radius/Component/XS` |
| width | 358px |
| height | 50px |

---

## Tokens aplicados

| Elemento | Token semántico | Valor |
|---|---|---|
| Fondo | `Background/Default/Default` | `#FFFFFF` |
| Label | `Text/Neutral/Default` | `rgb(71,85,105)` |
| Placeholder | `Text/Neutral/Secondary` | `rgb(100,116,139)` |
| Fuente label | DM Sans Regular 12px | `typography/caption` |
| Fuente placeholder | DM Sans Regular 14px | `typography/body` |
| Borde | `Border/Default/Default` | neutral/400 |

---

## Cuándo usarlo
- En formularios de captura de datos: login, registro, transferencia, KYC
- Para campos de texto libre, email, contraseña, IBAN, CLABE
- Siempre dentro de un patrón `formulario-simple` o `formulario-multipaso`

## Cuándo NO usarlo
- En pantallas L0 o L1 sin flujo de formulario
- Para selección de opciones — usar `filter-bar` o select
- En `modal-bottom-sheet` sin justificación clara

---

## Restricciones
- El `label` siempre describe claramente qué dato se pide
- El `placeholder` muestra el formato esperado, no repite el label
- Datos sensibles (IBAN, contraseña) deben enmascararse en el valor
- Detectar mercado del usuario antes de mostrar campo IBAN vs CLABE

---

## Uso en patrones

| Patrón | Cantidad típica | Notas |
|---|---|---|
| `formulario-simple` | 1-4 campos | Campos apilados verticalmente |
| `transferencia-bancaria` | 2-3 campos | Importe, destinatario, concepto |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Label = Placeholder | Texto duplicado | Label describe el campo, placeholder el formato |
| Campo IBAN en México | No se detectó mercado | Mostrar CLABE para México, IBAN para España/Colombia |
| Sin label visible | Label vacío | Siempre rellenar el label |