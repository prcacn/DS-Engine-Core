# Pantalla 02 · Login

**Patrón:** `formulario-simple`
**Intent type:** `formulario-simple`

## Brief

Pantalla de inicio de sesión para usuario registrado en app bancaria española. Formulario con campo de email o DNI y contraseña. Acceso opcional por biometría. Sin registro en esta pantalla — solo autenticación.

## Componentes requeridos

- `navigation-header` — variante: `back` · title: `Iniciar sesión`
- `input-text` — variante: `default` · label: `Email o DNI` · placeholder: `usuario@banco.es`
- `input-text` — variante: `password` · label: `Contraseña` · placeholder: `••••••••` · helper_text: `Mínimo 8 caracteres`
- `button-primary` — variante: `default` · label: `Entrar`

## Componentes opcionales

- `button-secondary` — variante: `outline` · label: `Usar huella o Face ID`
- `notification-banner` — variante: `error` · message: `Credenciales incorrectas. Inténtalo de nuevo.` · solo si hay error de autenticación
- `notification-banner` — variante: `warning` · message: `Tu sesión anterior expiró.` · solo si sesión caducada

## Componentes incompatibles

- `filter-bar` — no aplica en formularios
- `tab-bar` — no aplica en formularios

## Reglas KB aplicadas

- No mostrar CLABE ni IBAN en pantallas de login — geografía España
- El campo de contraseña debe ser siempre tipo `password` (enmascarado)
- No incluir `modal-bottom-sheet` en esta pantalla
- El `button-primary` debe mostrar estado `loading` mientras el sistema autentica

## Copy sugerido

- **Header:** `Iniciar sesión`
- **Campo 1:** `Email o DNI`
- **Campo 2:** `Contraseña`
- **Helper:** `¿Olvidaste tu contraseña?`
- **CTA principal:** `Entrar`
- **CTA secundario:** `Usar huella o Face ID`

## Contexto

- Geografía: España
- Dominio: banca retail
- Perfil de usuario: usuario registrado
- Estado de sesión: no autenticado
