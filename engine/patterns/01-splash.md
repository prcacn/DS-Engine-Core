# Pantalla 01 · Splash Screen

**Patrón:** `onboarding`
**Intent type:** `onboarding`

## Brief

Pantalla de bienvenida inicial de la app bancaria. Muestra el logotipo de la entidad centrado, un tagline institucional y un botón primario para comenzar. Sin navegación visible. Sin campos de entrada. El usuario no está autenticado todavía.

## Componentes requeridos

- `navigation-header` — variante: `transparent` · sin título visible · sin botón de back
- `button-primary` — variante: `default` · label: `Comenzar`
- `button-secondary` — variante: `outline` · label: `Ya tengo cuenta`

## Componentes opcionales

- `notification-banner` — variante: `info` · message: `Versión 2.4.1 disponible` · solo si hay actualización pendiente

## Reglas KB aplicadas

- Sin `filter-bar` ni `tab-bar` — incompatibles con onboarding
- Sin `input-text` en esta pantalla
- El `button-primary` debe ser el único CTA visible y dominante

## Copy sugerido

- **Tagline:** `Tu banco. Siempre contigo.`
- **CTA principal:** `Comenzar`
- **CTA secundario:** `Ya tengo cuenta`

## Contexto

- Geografía: España
- Dominio: banca retail
- Perfil de usuario: nuevo usuario o usuario no autenticado
- Estado de sesión: no autenticado
