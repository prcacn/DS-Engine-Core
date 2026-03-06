# button-primary

## Descripción
Botón de acción principal. Representa la acción más importante y esperada en una pantalla. Atrae la atención del usuario hacia el siguiente paso lógico del flujo.

## Propiedades
| Propiedad  | Tipo     | Valores posibles              | Valor por defecto |
|------------|----------|-------------------------------|-------------------|
| label      | string   | Cualquier texto               | "Continuar"       |
| state      | enum     | default, loading, disabled    | default           |
| size       | enum     | small, medium, large          | medium            |
| full_width | boolean  | true, false                   | true              |
| icon       | enum     | none, left, right             | none              |

## Cuándo usarlo
- Para confirmar la acción principal de una pantalla: Guardar, Enviar, Continuar, Aceptar
- Como botón de submit en formularios
- Para avanzar en flujos de onboarding o checkout
- Cuando hay una sola acción prioritaria clara

## Cuándo NO usarlo
- Para navegación entre secciones (usa tabs o links)
- Para acciones destructivas (usa button-danger)
- Para acciones secundarias o alternativas (usa button-secondary)
- Si ya hay otro button-primary visible en la misma pantalla
- En navigation-header (usa action_icon en su lugar)

## Restricciones
- Máximo 1 por pantalla visible al mismo tiempo
- El label no debe superar 3 palabras
- No usar junto a button-danger en el mismo grupo de acciones sin separación visual clara
- Siempre al final del contenido principal, nunca flotante sobre contenido

## Node ID en Figma
pending

## Tokens asociados
- background: color-action-primary
- text: color-text-on-primary
- background-disabled: color-action-disabled
- text-disabled: color-text-disabled
- radius: radius-button
- height: size-button-medium (48px)
