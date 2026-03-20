# confirmacion

## Descripción
Pantalla o modal de confirmación de una acción importante. Se usa cuando la acción es irreversible o tiene consecuencias significativas y el usuario debe confirmar conscientemente.

## Cuándo aplicar este pattern
- Eliminar un item
- Enviar dinero o ejecutar una operación financiera
- Cancelar una suscripción o servicio
- Confirmar datos antes de una acción definitiva

## Variantes del pattern

### Variante A — Modal (acción desde un listado)
Cuando la confirmación se lanza desde una pantalla de listado y no justifica cambiar de pantalla.

Componentes:
1. modal-bottom-sheet — variant: confirmation, height: auto
2. button-primary — dentro del modal, acción de confirmar
3. button-secondary — dentro del modal, acción de cancelar

### Variante B — Pantalla completa (acción crítica en flujo)
Cuando la confirmación es el paso final de un flujo y requiere mostrar el resumen completo.

Componentes:
1. navigation-header — variant: Type=Modal (L3 — solo cierre, sin icono izquierdo)
2. card-item × N — resumen de lo que se va a confirmar (solo lectura)
3. button-primary — confirmar acción
4. button-secondary — cancelar o modificar

## Reglas de composición
- Siempre hay button-primary y button-secondary — nunca solo uno
- El button-primary debe describir la acción, no decir "Confirmar" genérico: "Enviar 500€", "Eliminar cuenta"
- El button-secondary siempre dice "Cancelar" o "Volver" — nunca acción destructiva en secundario
- En Variante A: button-primary dentro del modal, button-secondary debajo
- En Variante B: button-secondary encima del button-primary (o a la izquierda si van en fila)

## Reglas de contenido
- El título del modal o pantalla debe describir qué se está confirmando
- Si la acción es irreversible, mencionarlo explícitamente en el texto descriptivo
- No usar lenguaje alarmista innecesario — ser directo y claro

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar filter-bar ni input-text en confirmaciones
- No usar la variante modal si el resumen requiere más de 4 card-item
