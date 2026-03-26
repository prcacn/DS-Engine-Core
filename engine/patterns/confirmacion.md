# confirmacion

## Descripción
Pantalla o modal de confirmación de una acción importante. Se usa cuando la acción es irreversible o tiene consecuencias significativas y el usuario debe confirmar conscientemente.

## Cuándo aplicar este pattern
- Eliminar un item
- Enviar dinero o ejecutar una operación financiera
- Cancelar una suscripción o servicio
- Confirmar datos antes de una acción definitiva

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L3 — solo cierre)
2. card-item — resumen de lo que se va a confirmar (solo lectura)
3. modal-bottom-sheet — variant: confirmation

## Componentes opcionales
- button-primary — confirmar acción (si no está dentro del modal)
- button-secondary — cancelar o modificar

## Reglas de composición
- Siempre hay button-primary y button-secondary — nunca solo uno
- El button-primary debe describir la acción, no decir "Confirmar" genérico: "Enviar 500€", "Eliminar cuenta"
- El button-secondary siempre dice "Cancelar" o "Volver" — nunca acción destructiva en secundario

## Reglas de contenido
- El título del modal o pantalla debe describir qué se está confirmando
- Si la acción es irreversible, mencionarlo explícitamente en el texto descriptivo
- No usar lenguaje alarmista innecesario — ser directo y claro

## Incompatibilidades
- No usar filter-bar ni input-text en confirmaciones
- No usar la variante modal si el resumen requiere más de 4 card-item

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
