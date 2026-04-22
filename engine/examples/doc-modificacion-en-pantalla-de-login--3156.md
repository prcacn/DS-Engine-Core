# Template: Login con Notificación de Modificación

## IDENTIFICACIÓN
- **Tipo de recurso:** template
- **Template ID:** modificacion-en-pantalla-de-login-
- **Tipo:** Pantalla de autenticación con notificación contextual
- **Categoría:** onboarding
- **Nodo Figma:** `460:2424`
- **Score DS:** 97% - APROBADO
- **Patrón:** login

## DESCRIPCIÓN
Pantalla de inicio de sesión (login) que incorpora una modificación mediante un banner de notificación contextual para comunicar avisos relevantes al usuario antes o durante el proceso de autenticación. Está dirigida a usuarios existentes que necesitan acceder a su cuenta y que deben ser informados de cambios o alertas del sistema. El flujo incluye campos de credenciales, opciones de recuperación, acción principal de ingreso y una alternativa de registro o acción secundaria.

## ESTRUCTURA VISUAL

```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header/modal]                              │
│  Cabecera modal con controles de navegación/cierre      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [input-text] — Campo de usuario / email          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [input-text] — Campo de contraseña               │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [notification-banner]                            │  │
│  │  Aviso contextual / alerta del sistema            │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [button-secondary] — Olvidé mi contraseña        │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [button-primary] — Iniciar sesión                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  [button-secondary] — Registrarse / Crear cuenta  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## COMPONENTES REQUERIDOS (ORDEN EXACTO)

| Orden | Componente | Node ID | Variante | Notas |
|-------|------------|---------|----------|-------|
| 0 | navigation-header/modal | `170:2843` | modal | Cabecera tipo modal con opción de cierre o retorno |
| 1 | input-text | `185:3896` | default | Campo de entrada para identificador de usuario (email, DNI o usuario) |
| 2 | input-text | `185:3896` | password | Campo de entrada para contraseña con opción de visibilidad |
| 3 | notification-banner | `185:3903` | informative | Banner de notificación contextual que muestra el aviso de modificación o alerta del sistema |
| 4 | button-secondary | `185:3894` | text-only | Enlace de recuperación de contraseña |
| 5 | button-primary | `185:3893` | default | Acción principal de inicio de sesión |
| 6 | button-secondary | `185:3894` | default | Acción alternativa de registro o navegación a creación de cuenta |

---

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Gap | 16px |
| Padding | 0px (header) / 24px (body horizontal) / 32px (body vertical) |
| Fondo | `color/background/primary` |
| Ancho | 390px |
| Alineación horizontal | CENTER |
| Distribución vertical | TOP |
| Overflow | HIDDEN |

---

## TOKENS APLICADOS

| Token | Valor resuelto |
|-------|----------------|
| `color/background/primary` | #FFFFFF |
| `color/text/primary` | #1A1A1A |
| `color/text/secondary` | #6B6B6B |
| `color/border/default` | #D4D4D4 |
| `color/interactive/primary` | #0066FF |
| `color/interactive/primary-hover` | #0052CC |
| `color/notification/info-background` | #E8F4FD |
| `color/notification/info-border` | #0066FF |
| `spacing/xs` | 8px |
| `spacing/sm` | 12px |
| `spacing/md` | 16px |
| `spacing/lg` | 24px |
| `spacing/xl` | 32px |
| `radius/md` | 8px |
| `radius/lg` | 12px |
| `typography/heading/md` | 20px / 700 / 1.3 |
| `typography/body/md` | 16px / 400 / 1.5 |
| `typography/label/md` | 14px / 500 / 1.4 |
| `shadow/modal` | 0px 4px 24px rgba(0,0,0,0.12) |

---

## NAVEGACIÓN

| Acción | Destino |
|--------|---------|
| Tap en icono cerrar (navigation-header) | Cierra modal / regresa a pantalla anterior |
| Tap en "Olvidé mi contraseña" (button-secondary #4) | Flujo de recuperación de contraseña |
| Tap en "Iniciar sesión" (button-primary #5) | Validación de credenciales → Dashboard / Home autenticado |
| Tap en "Registrarse" (button-secondary #6) | Flujo de registro / creación de cuenta |
| Tap en enlace del notification-banner (si aplica) | Pantalla de detalle de la notificación o recurso externo |

---

## REGLAS DE NEGOCIO

| Regla | Descripción |
|-------|-------------|
| RN-001 | Ambos campos (usuario y contraseña) son obligatorios. El botón primario permanece en estado `disabled` hasta que ambos campos contengan valor. |
| RN-002 | El campo de contraseña debe ofrecer toggle de visibilidad (icono ojo) para permitir al usuario verificar su entrada. |
| RN-003 | El notification-banner es de carácter informativo y se muestra de forma condicional según configuración del backend (ej: mantenimiento programado, cambio de políticas, actualización de términos). |
| RN-004 | Tras 3 intentos fallidos de autenticación, se debe mostrar un notification-banner de tipo error con mensaje de bloqueo temporal y enlace a recuperación. |
| RN-005 | El formulario debe validar formato de email/usuario en el primer campo antes de enviar la petición de autenticación. |
| RN-006 | El notification-banner no debe ser descartable si contiene información crítica de seguridad o regulatoria. |
| RN-007 | La pantalla se presenta en contexto modal (navigation-header/modal), lo que implica que el usuario puede cerrar y volver al flujo anterior sin autenticarse. |
| RN-008 | El botón secundario inferior ("Registrarse") solo es visible si el contexto permite registro de nuevos usuarios. |

---

## COMPONENTES (Resumen)

| Componente | Node ID | Notas |
|------------|---------|-------|
| navigation-header/modal | `170:2843` | Cabecera modal con acción de cierre. Define contexto de superposición sobre flujo existente. |
| input-text | `185:3896` | Campo de identificación del usuario. Soporta validación de formato (email/usuario/DNI). |
| input-text | `185:3896` | Campo de contraseña. Incluye toggle de visibilidad y enmascaramiento por defecto. |
| notification-banner | `185:3903` | Banner informativo contextual. Elemento diferenciador de esta modificación respecto al login estándar. Renderizado condicional desde backend. |
| button-secondary | `185:3894` | Enlace de recuperación de contraseña. Posicionado después del banner para mantener proximidad con los campos de credenciales. |
| button-primary | `185:3893` | Acción principal de autenticación. Estado disabled hasta validación de campos requeridos. |
| button-secondary | `185:3894` | Acción alternativa de navegación a registro. Menor jerarquía visual respecto al botón primario. |