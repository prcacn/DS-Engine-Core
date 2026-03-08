# dashboard
## Descripción
Pantalla inicial que ofrece una visión resumida del estado general del usuario o del producto. Presenta información clave, accesos rápidos y módulos priorizados según el uso más frecuente.

## Cuándo aplicar este pattern
- Home de la aplicación (punto de entrada tras login)
- Superficies donde se resumen productos, cuentas o estados
- Cuando el usuario necesita orientación rápida hacia acciones frecuentes
- Flujos donde la información es más importante que la navegación por secciones

## Componentes requeridos (en este orden)
1. navigation-header — variant: default (sin back)
2. summary-cards × N — tarjetas con datos clave (KPIs, estado, saldo, progreso)
3. quick-actions — accesos rápidos principales (entre 2 y 5)
4. section-header × N — título de cada bloque de contenido
5. card-item × N — listas cortas o módulos informativos

## Componentes opcionales
- avatar-user — acceso al perfil desde el header
- banner-informativo — campañas, avisos o novedades (máx. 1)
- carousel — para módulos desplazables (solo si es imprescindible)
- chip-filters — para cambiar la vista (p. ej., “Hoy / Semana / Mes”)
- empty-state — en módulos que puedan estar vacíos
- notification-icon — en el header

## Reglas de composición
- navigation-header siempre fijo arriba; evitar sobrecargarlo
- El primer scroll debe mostrar: summary-cards + quick-actions
- summary-cards se agrupan visualmente (máx. 3 por fila según diseño)
- quick-actions siempre con icono + label; ordenados por frecuencia
- Cada sección debe usar section-header claro antes de sus card-item
- No abusar de módulos; priorizar 3–5 bloques principales por pantalla
- Si hay banner, se coloca bajo el header y antes de summary-cards

## Reglas de contenido
- Títulos breves y orientados al usuario (“Tu situación hoy”, “Tus productos”)
- Los summary-cards deben mostrar valores accionables y actualizados
- quick-actions deben ser tareas frecuentes, no enlaces secundarios
- card-item debe evitar información redundante respecto a summary-cards
- Si hay datos sensibles, mostrarlos con modos de ocultar/mostrar (eye-button)

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar como pantalla de detalle (usar `detalle.md`)
- No incluir formularios; para eso están `formulario-simple` o `formulario-multipaso`
- Evitar flujos profundos desde el dashboard (máx. 1 nivel)
- No mezclar demasiados módulos distintos (riesgo de ruido visual)