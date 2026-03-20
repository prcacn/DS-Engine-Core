# Template: Login

**Nivel de navegación:** L2
**Intent:** formulario-simple
**Keywords:** login, iniciar sesión, acceder, contraseña, email, autenticacion
**Estado:** aprobado
**Score mínimo requerido:** 80

## DESCRIPCIÓN
Pantalla base aprobada para login. Usar como punto de partida para cualquier brief
que pida acceso, login o autenticación de usuario.

## COMPONENTES REQUERIDOS

| Orden | Componente | Node ID | Variante | Notas |
|---|---|---|---|---|
| 1 | navigation-header | `1:3` | close | title: "Iniciar sesión" |
| 2 | input-text | `1:21` | default | label: "Email", placeholder: "tu@email.com" |
| 3 | input-text | `1:21` | password | label: "Contraseña" |
| 4 | button-primary | `1:9` | default | label: "Iniciar sesión" |
| 5 | button-secondary | `1:11` | default | label: "¿Olvidaste tu contraseña?" |

## RESTRICCIONES
- Máximo 2 input-text en la pantalla base de login
- button-primary siempre al final del formulario
- No incluir tab-bar — el usuario no está autenticado aún
