# lista-con-filtros

## Descripción
Pantalla de listado con capacidad de filtrado por categorías. El caso de uso más común en aplicaciones de datos: mostrar una colección de items que el usuario puede explorar y filtrar.

## Cuándo aplicar este pattern
- Listados de productos, fondos, transacciones, usuarios, resultados
- Cuando hay entre 2 y 8 categorías de filtrado
- Cuando el listado puede quedar vacío tras filtrar

## Componentes requeridos (en este orden)
1. navigation-header — variant: with-back o default según profundidad
2. filter-bar — siempre debajo del header
3. card-item × N — mínimo 1, máximo 20 en primera carga
4. empty-state — CONDICIONAL: solo si card-item count = 0

## Componentes opcionales
- button-primary — solo si el usuario puede crear un nuevo item desde esta pantalla
  - posición: fijo en la parte inferior, encima del tab-bar si existe
- modal-bottom-sheet — para confirmar acciones sobre items del listado

## Reglas de composición
- navigation-header siempre es el primer elemento
- filter-bar siempre va inmediatamente debajo del navigation-header
- empty-state y card-item son mutuamente excluyentes en el área de lista
- Si hay button-primary flotante, no puede haber otro button-primary en la pantalla
- El número de placeholder cards en carga debe ser 6 (no más, no menos)

## Reglas de contenido
- El title del navigation-header debe nombrar la entidad en plural: "Fondos", "Transacciones"
- El filter-bar siempre debe incluir "Todos" como primera opción
- El empty-state.action_label debe ser "Limpiar filtros" si el vacío es por filtro activo

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar con tab-bar en el mismo nivel que filter-bar
- No usar más de 1 filter-bar por pantalla
