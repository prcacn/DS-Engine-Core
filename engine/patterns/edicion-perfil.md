# edicion-perfil
## Descripción
Pantalla de modificación de datos existentes del usuario. Los campos aparecen
prerellenados con los valores actuales. El CTA confirma los cambios.

## Cuándo aplicar este pattern
- Editar nombre, apellidos, teléfono o email del perfil
- Cambiar contraseña o PIN
- Actualizar dirección o datos de contacto
- Modificar preferencias de cuenta

## Nivel de navegación
L2 — se accede desde perfil-usuario (L1)

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2)
2. input-text × N — campos prerellenados con valores actuales
3. button-primary — label: "Guardar cambios" / "Actualizar"

## Componentes opcionales
- button-secondary — label: "Cancelar"
- notification-banner — variant: success | confirmación tras guardar
- notification-banner — variant: warning | si hay datos sin verificar
- modal-bottom-sheet — si el cambio requiere confirmación adicional (ej: cambiar email)

## Reglas de composición
- Los input-text deben tener el valor actual como placeholder o valor prerellenado
- button-primary siempre al final
- Si el cambio es sensible (contraseña, email), añadir modal-bottom-sheet de confirmación

## Reglas de contenido
- button-primary.label indica modificación, nunca "Enviar"
- Si hay campo contraseña nuevo, incluir helper_text con requisitos
- El título del header refleja qué se está editando: "Editar perfil", "Cambiar contraseña"

## Incompatibilidades
- No usar filter-bar
- No usar card-item en el mismo scroll
- No usar tab-bar (L2)

## Composition pattern
Usa: composition-patterns/form-block.md

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
