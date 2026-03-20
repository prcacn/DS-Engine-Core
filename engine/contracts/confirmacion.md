# confirmacion

## Descripción
Pantalla o modal de confirmación de una acción importante. Se usa cuando la acción es irreversible o tiene consecuencias significativas y el usuario debe confirmar conscientemente.

## Cuándo aplicar este pattern
- Eliminar un item o cuenta
- Enviar dinero o ejecutar una operación financiera
- Cancelar una suscripción o servicio
- Confirmar datos antes de una acción definitiva

## Componentes requeridos (en este orden)
1. navigation-header — variant: with-back siempre
2. button-primary — acción de confirmar, label descriptivo
3. button-secondary — acción de cancelar

## Componentes opcionales
- modal-bottom-sheet — variant: confirmation, para acciones lanzadas desde un listado
- card-item — resumen de lo que se va a confirmar (solo lectura, show_chevron: false)

## Reglas de composición
- Siempre hay button-primary y button-secondary — nunca solo uno
- El button-primary debe describir la acción concreta: "Eliminar cuenta", "Enviar 500€"
- El button-secondary siempre dice "Cancelar" o "Volver"
- Si hay card-item, son solo de lectura — show_chevron: false
- Si la acción viene de un listado, usar modal-bottom-sheet en lugar de pantalla completa

## Reglas de contenido
- El título del navigation-header describe qué se está confirmando
- Si la acción es irreversible, mencionarlo explícitamente en el texto descriptivo
- No usar lenguaje alarmista innecesario — ser directo y claro

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar filter-bar ni input-text en confirmaciones
- No anidar modal-bottom-sheet dentro de otro modal
- No usar mas de un button-primary
