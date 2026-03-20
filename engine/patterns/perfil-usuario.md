# perfil-usuario

## Descripción
Pantalla de datos personales, cuenta y configuración del usuario autenticado. Agrupa la información del usuario en secciones con list-header. Siempre lleva tab-bar por ser L1.

## Cuándo aplicar este pattern
- Ver o editar datos personales
- Configuración de la cuenta
- Ajustes de notificaciones, seguridad, idioma
- Vista del perfil propio

## Componentes requeridos (en este orden)
1. navigation-header — variant: default (L1 — título "Mi perfil" o "Cuenta")
2. list-header — mínimo 1, para agrupar secciones: "Datos personales", "Seguridad", "Preferencias"
3. card-item × N — filas de datos o ajustes del usuario (show_chevron: true si navegan a detalle)
4. tab-bar — SIEMPRE en L1. sticky en la parte inferior

## Componentes opcionales
- button-primary — solo para acciones globales como "Cerrar sesión" o "Eliminar cuenta"
- button-secondary — acción alternativa a la principal
- notification-banner — avisos de cuenta (verificación pendiente, KYC requerido)
- badge — estado de verificación u otros indicadores

## Reglas de composición
- navigation-header sin back — es pantalla raíz del tab de perfil (L1)
- tab-bar obligatorio en L1
- Cada sección separada con list-header
- card-item con show_chevron: true si navega a subpantalla de edición
- button-primary al final si existe — acción destructiva como "Cerrar sesión"

## Reglas de contenido
- list-header usa labels claros: "Datos personales", "Seguridad", "Ayuda"
- card-item muestra el valor actual de cada dato: "Email · pablo@ejemplo.com"
- Acciones destructivas (cerrar sesión, eliminar) van al final y con button-primary variant: destructive

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- filter-bar (no hay filtrado en perfil)
- empty-state (el perfil siempre tiene datos)
- modal-bottom-sheet solo para confirmar acciones destructivas (cerrar sesión, eliminar)
