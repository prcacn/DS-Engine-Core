# global-rules / navigation.md
# Reglas Globales de Navegación

> Estas reglas se aplican a **todas las pantallas** generadas por el engine, sin excepción.
> Son previas a cualquier decisión de patrón o composición.
> El Agente de Navegación las aplica antes de que el Arquitecto construya la pantalla.

---

## 1. Niveles de navegación

Toda pantalla tiene un nivel de navegación. El nivel determina la variante obligatoria
del `navigation-header` y la presencia o ausencia de `tab-bar`.

| Nivel | Descripción | Variante header | tab-bar |
|---|---|---|---|
| **L0** | Pantalla raíz — home / inicio de la app | `Type=Dashboard` | sí (opcional) |
| **L1** | Sección principal accesible desde tab-bar | `Type=Predeterminada` | sí (opcional) |
| **L2** | Pantalla a la que se navega desde L0 o L1 | `Type=Modal` + `li:arrow-left` | no |
| **L3** | Pantalla de proceso temporal (confirmación, flujo) | `Type=Modal` sin icono izquierdo | no |
| **—** | Modal bottom sheet / onboarding lineal | sin navigation-header | no |

---

## 2. Cómo inferir el nivel desde el brief

El engine infiere el nivel de navegación automáticamente a partir del intent y el patrón.
No hace falta que el diseñador lo especifique en el brief.

| Patrón detectado | Nivel asignado | Motivo |
|---|---|---|
| `dashboard` | L0 | Punto de entrada principal |
| `lista-con-filtros` | L1 | Sección principal con tab-bar |
| `perfil-usuario` | L1 | Sección principal con tab-bar |
| `notificaciones` | L1 | Sección principal con tab-bar |
| `detalle` | L2 | Se navega desde un listado |
| `formulario-simple` | L2 | Se navega desde una acción |
| `transferencia-bancaria` | L2 | Se navega desde una acción |
| `onboarding` | L2 | Flujo iniciado desde L0 |
| `confirmacion` | L3 | Proceso temporal irreversible |
| `error-estado` | L2 | Pantalla de estado dentro de un flujo |

---

## 3. Reglas de aplicación obligatorias

### 3.1 navigation-header es singleton
- Solo puede existir **uno** por pantalla.
- Siempre es el **primer componente** en el array de composición (order: 0).
- Nunca aparece dentro de un `modal-bottom-sheet`.

### 3.2 La variante del header se asigna por nivel — no por criterio libre
- El Arquitecto **no puede** elegir variante libremente. La variante viene del nivel.
- Si el brief fuerza un patrón que contradice el nivel inferido, el nivel tiene prioridad.

### 3.3 tab-bar solo en L0 y L1
- En L2 y L3 nunca hay `tab-bar`.
- Si el patrón es `confirmacion`, `detalle`, `formulario-simple` o `transferencia-bancaria`: eliminar `tab-bar` de la composición aunque el patrón lo sugiera como opcional.

### 3.4 L0 nunca lleva título en el header
- `Type=Dashboard` no tiene campo `title` en el navigation-header.
- El título de la pantalla se ubica en el body, no en el header.

### 3.5 L3 no lleva icono izquierdo
- `Type=Modal` en L3 solo tiene `li:x` a la derecha. Sin arrow-left.
- Esto indica que el usuario no puede volver — solo confirmar o cancelar.

---

## 4. Node IDs de referencia (Figma)

Estos son los nodeIds del componente real en el archivo Simple DS:

| Variante | Node ID |
|---|---|
| `Type=Dashboard` (L0) | `170:2660` |
| `Type=Predeterminada` (L1) | `112:1853` |
| `Type=Modal` (L2/L3) | `170:2843` |
| COMPONENT_SET completo | `170:2653` |

---

## 5. Errores que esta regla previene

| Error frecuente | Causa | Cómo lo previene esta regla |
|---|---|---|
| Dashboard con arrow-left | Arquitecto asigna `with-back` por defecto | L0 → `Type=Dashboard` obligatorio |
| Formulario sin botón de volver | Arquitecto usa `default` en L2 | L2 → `Type=Modal` con `li:arrow-left` |
| tab-bar en confirmación | Patrón lo incluye como opcional | L3 excluye tab-bar sin excepción |
| Dos navigation-header | Fusión de agentes duplica | Regla singleton — se elimina el duplicado |

---

## Referencias
- Contrato completo: `engine/contracts/navigation-header.md`
- Componente Figma: node `1:3` (component set: `170:2653`)
