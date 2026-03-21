# formulario-default
## Descripción
Fallback para formularios que no encajan en login, registro, edicion-perfil ni formulario-producto.
Para formularios lineales de hasta 5 campos en una sola pantalla.
Usar solo cuando el intent no sea suficientemente específico para clasificar en un patrón concreto.

## Cuándo aplicar este pattern
- Captura de datos genérica no clasificable como login, registro o edición
- Formularios simples de contacto, solicitud o búsqueda avanzada
- Cualquier flujo de 1-5 campos sin dominio financiero específico

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2)
2. input-text × N — entre 1 y 5 campos según el brief
3. button-primary — al final, label descriptivo de la acción

## Componentes opcionales
- button-secondary — para cancelar o volver
- notification-banner — para avisos contextuales
- modal-bottom-sheet — si la acción es irreversible

## Reglas de composición
- navigation-header siempre primero
- input-text en orden lógico del flujo
- button-primary siempre al final, nunca entre campos
- No mezclar input-text con card-item

## Reglas de contenido
- Labels de input-text específicos, nunca "Campo X"
- button-primary.label describe la acción concreta
- Campos requeridos marcados con required: true

## Incompatibilidades
- No usar con filter-bar
- Más de 5 campos → usar formulario multipaso

## Nota
Este patrón es el fallback del sistema. Si el brief es específico, usar:
- login.md — acceso con email/contraseña
- registro.md — creación de cuenta con N campos
- edicion-perfil.md — modificación de datos existentes
- formulario-producto.md — contratación o configuración de producto financiero
