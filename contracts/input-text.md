# input-text

## Descripción
Campo de entrada de texto. Permite al usuario introducir información textual. Base de cualquier formulario del sistema.

## Propiedades
| Propiedad    | Tipo     | Valores posibles                        | Valor por defecto |
|--------------|----------|-----------------------------------------|-------------------|
| label        | string   | Cualquier texto                         | ""                |
| placeholder  | string   | Cualquier texto                         | ""                |
| helper_text  | string   | Cualquier texto                         | ""                |
| state        | enum     | default, focus, error, success, disabled| default           |
| type         | enum     | text, email, password, number, search   | text              |
| show_icon    | boolean  | true, false                             | false             |
| icon_position| enum     | left, right                             | right             |
| required     | boolean  | true, false                             | false             |

## Cuándo usarlo
- En cualquier formulario donde el usuario deba introducir texto libre
- Para búsquedas (type: search)
- Para credenciales (type: email, type: password)
- Cuando necesitas capturar un dato específico del usuario

## Cuándo NO usarlo
- Para seleccionar entre opciones conocidas (usa un selector o radio buttons)
- Para fechas (usa un date picker)
- Para cantidades con rangos definidos (usa un slider o stepper)
- En navigation-header — usa la acción de search del header

## Restricciones
- Siempre llevar label visible (nunca solo placeholder como label)
- El helper_text de error debe ser específico y accionable, no genérico
- Máximo 1 campo de contraseña por pantalla visible
- No apilar más de 5 input-text sin separación visual de secciones

## Node ID en Figma
pending

## Tokens asociados
- border: color-border-default
- border-focus: color-action-primary
- border-error: color-feedback-error
- background: color-surface-secondary
- label: color-text-secondary, size-text-sm
- text: color-text-primary, size-text-md
- helper: color-text-secondary, size-text-xs
- helper-error: color-feedback-error
- radius: radius-input
- height: size-input-default (52px)
