# notification-banner

## Node ID en Figma
20:802

## Descripción
Banner de notificación contextual. Muestra avisos del sistema, alertas regulatorias, errores de conexión o información relevante. Siempre va justo debajo del `navigation-header` cuando está presente.

---

## Variantes
Componente simple — sin variantes de tipo.

| Node ID | Dimensiones | Uso |
|---------|-------------|-----|
| `20:802` | 390×64px | Aviso contextual de sistema |

---

## Estructura visual
```
390px · 64px altura · radius 12px
┌─────────────────────────────────────────────────────────┐
│ ←16px                                           16px→   │
│  [● 8×8]  [Frame: título + descripción 338×34]         │
│  dot       12px V gap 2px                               │
└─────────────────────────────────────────────────────────┘
```
- Fondo: `rgb(240,249,255)` — `Background/Info/Subtle` (sky/100)
- Dot: color semántico según tipo
- Layout: HORIZONTAL · padding H: 16px · padding V: 12px · gap: 12px · radius: 12px

---

## Propiedades

| Propiedad | Tipo | Default | Editable |
|---|---|---|---|
| `title` | TEXT | — | Sí |
| `message` | TEXT | — | Sí |
| Tipo semántico | Color | Info (sky) | Según contexto |

---

## Layout

| Propiedad | Valor |
|---|---|
| layoutMode | HORIZONTAL |
| paddingLeft / Right | 16px → `Spacing/Padding/Horizontal/MD` |
| paddingTop / Bottom | 12px → `Spacing/Padding/Vertical/LG` |
| gap | 12px → `Spacing/Gap/LG` |
| borderRadius | 12px → `Spacing/Radius/Component/MD` |
| width | 390px |
| height | 64px |

---

## Tokens aplicados por semántica

| Tipo | Fondo | Dot | Uso |
|---|---|---|---|
| Info | `Background/Info/Subtle` — sky/100 | `Icon/Info` — sky/700 | Avisos informativos, datos en caché |
| Warning | `Background/Warning/Subtle` — amber/100 | `Icon/Warning` — amber/700 | Alertas regulatorias, acceso restringido |
| Danger | `Background/Danger/Subtle` — red/100 | `Icon/Danger` — red/700 | Errores de conexión, cuenta bloqueada |
| Positive | `Background/Positive/Subtle` — green/100 | `Icon/Positive` — green/700 | Confirmación de éxito |

---

## Cuándo usarlo
- Aviso CNMV/CNBV obligatorio en pantallas de inversión
- Modo sin conexión con datos cacheados
- Restricción de acceso (perfil de riesgo incompleto)
- Error de carga que permite continuar con datos en caché
- Confirmación de operación exitosa

## Cuándo NO usarlo
- Para errores que bloquean totalmente la pantalla — usar `empty-state` con variante error
- Más de 1 por pantalla
- En `modal-bottom-sheet`

---

## Restricciones
- **Máximo 1 por pantalla**
- Siempre justo debajo del `navigation-header` (order: 1 si hay banner)
- El tipo semántico (color) siempre corresponde al contenido: nunca decorativo
- En pantallas de inversión en España: `notification-banner` con aviso CNMV es **obligatorio** (normativa KB)

---

## Uso en patrones

| Patrón | Cuándo | Tipo |
|---|---|---|
| `lista-con-filtros` | Sin conexión o acceso restringido | Warning / Info |
| `detalle` | Aviso regulatorio CNMV | Warning |
| `confirmacion` | Aviso de irreversibilidad | Warning |
| `error-estado` | Error de carga con datos en caché | Danger / Info |

---

## Errores frecuentes

| Error | Causa | Solución |
|---|---|---|
| Banner de error verde | Color semántico incorrecto | Usar rojo para errores, verde para éxito |
| Dos banners en pantalla | Exceso de información | Máximo 1, priorizar el más crítico |
| Banner sin aviso CNMV en pantalla de inversión | Incumplimiento normativo | Obligatorio en España según normativa KB |