# navigation-header

## Descripción
Barra de navegación superior. Elemento fijo que aparece en la parte alta de cada pantalla. Comunica al usuario dónde está y le permite volver atrás o acceder a acciones contextuales.

## Propiedades
| Propiedad     | Tipo      | Valores posibles                        | Valor por defecto |
|---------------|-----------|-----------------------------------------|-------------------|
| title         | string    | Cualquier texto                         | ""                |
| variant       | enum      | default, with-back, with-close, minimal | default           |
| show_action   | boolean   | true, false                             | false             |
| action_icon   | enum      | search, filter, more, share             | more              |

## Cuándo usarlo
- En todas las pantallas de la aplicación excepto la home/tab principal
- Cuando el usuario ha navegado a una pantalla secundaria y necesita volver
- Para comunicar claramente el contexto de la pantalla actual

## Cuándo NO usarlo
- En la pantalla principal con tab bar — usa la variante minimal sin botón de back
- En modales — los modales tienen su propio header interno
- En pantallas de onboarding que requieren flujo lineal sin escape

## Restricciones
- Siempre es el primer elemento visible de la pantalla
- Solo puede haber uno por pantalla
- El title no debe superar 32 caracteres
- No combinar show_action: true con variant: minimal

## Node ID en Figma
1:3

## Tokens asociados
- background: color-surface-primary
- title: color-text-primary, size-text-lg, weight-bold
- icon: color-icon-primary
- height: size-header-default (56px)
