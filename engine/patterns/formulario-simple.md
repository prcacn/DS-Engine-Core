# formulario-simple

## Descripción
Pantalla de captura de datos con campos de entrada y acción de submit. Para formularios lineales de hasta 5 campos que no requieren pasos múltiples.

## Cuándo aplicar este pattern
- Registro o login
- Edición de datos del perfil
- Creación de un item simple
- Cualquier flujo que requiera capturar información del usuario en una sola pantalla

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2 — arrow-left izquierda, cierre derecha)
2. input-text × N — entre 1 y 5 campos
3. button-primary — al final del formulario, label descriptivo de la acción

## Componentes opcionales
- button-secondary — para cancelar o volver, debajo del button-primary
- modal-bottom-sheet — para confirmar antes de enviar si la acción es irreversible

## Reglas de composición
- navigation-header siempre primero
- Los input-text van en el orden lógico del flujo (email antes que contraseña, nombre antes que apellido)
- button-primary siempre al final, nunca entre campos
- button-secondary si existe, siempre debajo del button-primary
- No mezclar input-text con card-item en el mismo formulario

## Reglas de contenido
- El label de cada input-text debe ser específico y no usar "Campo X"
- El button-primary.label debe describir la acción, no decir solo "Enviar": "Crear cuenta", "Guardar cambios"
- Si hay campos requeridos, marcarlos con required: true
- El helper_text de error debe explicar qué está mal y cómo corregirlo

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar con filter-bar
- No usar con card-item en el mismo scroll
- Más de 5 campos requiere un formulario multipaso (pattern diferente)
