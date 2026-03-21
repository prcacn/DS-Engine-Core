# login
## Descripción
Pantalla de acceso a la aplicación. Estructura fija: identificador + contraseña + acción de entrada.
Siempre 2 campos. No varía según el brief.

## Cuándo aplicar este pattern
- Acceso con email y contraseña
- Acceso con teléfono y contraseña
- Acceso con usuario y PIN
- Re-autenticación dentro de la app

## Nivel de navegación
L2 — el usuario llega aquí desde onboarding o sesión expirada

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2)
2. input-text — variant: default | label: Email / Teléfono / Usuario
3. input-text — variant: password | label: Contraseña / PIN
4. button-primary — label: "Entrar" / "Iniciar sesión" / "Acceder"

## Componentes opcionales
- button-secondary — label: "¿Olvidaste tu contraseña?" o "Registrarme"
- notification-banner — variant: error | para mostrar error de credenciales
- notification-banner — variant: warning | para sesión expirada

## Reglas de composición
- Exactamente 2 input-text — nunca más, nunca menos
- El primer input siempre es el identificador (email, teléfono o usuario)
- El segundo input siempre es la credencial (password o numeric para PIN)
- button-primary al final, siempre visible sin scroll si es posible
- Si hay error de login, notification-banner va entre el header y los campos

## Reglas de contenido
- button-primary.label nunca dice "Enviar" — siempre una acción de acceso
- El placeholder del campo contraseña nunca muestra caracteres reales
- El mensaje de error no especifica qué campo está mal (seguridad)

## Incompatibilidades
- No usar filter-bar
- No usar card-item
- No usar tab-bar (L2)

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
