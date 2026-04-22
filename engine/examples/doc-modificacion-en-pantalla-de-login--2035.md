# Template: Login - Modificación de Pantalla de Inicio de Sesión

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** modificacion-en-pantalla-de-login-
- **Tipo:** Pantalla de autenticación / inicio de sesión
- **Categoría:** onboarding
- **Nodo Figma:** `460:2424`
- **Score DS:** 97% - APROBADO
- **Patrón:** login

## DESCRIPCIÓN
Pantalla de inicio de sesión modificada que permite a los usuarios autenticarse en la aplicación mediante la introducción de sus credenciales (usuario y contraseña). Incluye un banner de notificación contextual para comunicar avisos relevantes del sistema al usuario durante el proceso de login, así como acciones secundarias para recuperación de contraseña o registro alternativo. Está dirigida a usuarios recurrentes y nuevos que necesitan acceder a su cuenta.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  [Navigation Header / Modal]                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Input Text - Usuario / Email                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Input Text - Contraseña                          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Notification Banner                              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Button Secondary - Olvidé mi contraseña          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Button Primary - Iniciar Sesión                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Button Secondary - Registrarse / Acción alt.     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header/modal | `170:2843` | modal | Cabecera de navegación en variante modal; permite cerrar o volver atrás |
| 1 | input-text | `185:3896` | default | Campo de entrada para identificador de usuario (email, DNI o usuario) |
| 2 | input-text | `185:3896` | password | Campo de entrada para contraseña con opción de visibilidad |
| 3 | notification-banner | `185:3903` | informative | Banner contextual para avisos del sistema (mantenimiento, cambios, alertas) |
| 4 | button-secondary | `185:3894` | default | Acción secundaria superior: recuperación de contraseña u olvido de credenciales |
| 5 | button-primary | `185:3893` | default | Acción principal: ejecutar inicio de sesión |
| 6 | button-secondary | `185:3894` | default | Acción secundaria inferior: registro de nuevo usuario o acceso alternativo |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding | 0px 16px 24px 16px |
| Fondo | $color-background-primary (#FFFFFF) |
| Ancho | 390px |
| Alignment | stretch |
| Content Alignment | center |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `$color-background-primary` | #FFFFFF |
| `$color-text-primary` | #1A1A1A |
| `$color-text-secondary` | #6B6B6B |
| `$color-interactive-primary` | #0066CC |
| `$color-interactive-primary-hover` | #004C99 |
| `$color-border-default` | #D4D4D4 |
| `$color-notification-background` | #FFF8E1 |
| `$color-notification-text` | #5D4200 |
| `$spacing-xs` | 8px |
| `$spacing-sm` | 12px |
| `$spacing-md` | 16px |
| `$spacing-lg` | 24px |
| `$spacing-xl` | 32px |
| `$radius-md` | 8px |
| `$font-family-base` | System default |
| `$font-size-body` | 16px |
| `$font-size-label` | 14px |
| `$font-weight-regular` | 400 |
| `$font-weight-semibold` | 600 |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en botón cerrar (navigation-header) | Cierre del modal / regreso a pantalla anterior |
| Tap en "Iniciar Sesión" (button-primary) | Validación de credenciales → Dashboard principal / Error de autenticación |
| Tap en "Olvidé mi contraseña" (button-secondary superior) | Flujo de recuperación de contraseña |
| Tap en "Registrarse" (button-secondary inferior) | Flujo de registro / onboarding de nuevo usuario |
| Tap en enlace del notification-banner (si aplica) | Página informativa o detalle del aviso del sistema |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001: Campos obligatorios | Ambos campos input-text (usuario y contraseña) son obligatorios. El botón primario debe permanecer deshabilitado hasta que ambos campos contengan valores válidos |
| RN-002: Validación de formato | El campo de usuario debe validar formato de email o identificador según el tipo configurado antes de permitir el envío |
| RN-003: Enmascaramiento de contraseña | El campo de contraseña debe mostrar caracteres enmascarados por defecto, con opción de toggle para mostrar/ocultar el texto |
| RN-004: Intentos de login | Tras N intentos fallidos consecutivos (según configuración del backend), se debe bloquear temporalmente el acceso y mostrar mensaje en el notification-banner |
| RN-005: Notification banner condicional | El notification-banner se muestra únicamente cuando existe un aviso activo del sistema (mantenimiento programado, cambios de política, etc.). Si no hay avisos, el componente no se renderiza y el layout se ajusta |
| RN-006: Estado de error en inputs | Ante credenciales incorrectas, ambos campos deben transicionar a estado de error con mensaje descriptivo sin revelar cuál credencial es incorrecta |
| RN-007: Accesibilidad | Todos los campos deben soportar navegación por teclado y lectores de pantalla. Los labels deben estar asociados correctamente a los inputs |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header/modal | `170:2843` | Header modal con acción de cierre. Puede incluir título contextual "Iniciar sesión" |
| input-text | `185:3896` | Reutilizado para campo de usuario. Debe incluir label, placeholder y estados (default, focus, error, disabled) |
| input-text | `185:3896` | Reutilizado para campo de contraseña. Incluye icono de toggle de visibilidad y mismos estados |
| notification-banner | `185:3903` | Banner informativo contextual. Renderizado condicional según avisos activos del sistema. Soporta variantes: informative, warning, error |
| button-secondary | `185:3894` | Acción de recuperación de contraseña. Alineación y estilo de enlace textual secundario |
| button-primary | `185:3893` | CTA principal "Iniciar sesión". Full-width. Estados: default, hover, pressed, disabled, loading |
| button-secondary | `185:3894` | Acción alternativa de registro o acceso secundario. Posicionado al final del flujo |