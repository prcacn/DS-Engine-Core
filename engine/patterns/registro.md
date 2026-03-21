# registro
## Descripción
Pantalla de creación de cuenta o alta de usuario. El número de campos es variable
y lo determina el brief. Usa form-block como composition-pattern base.

## Cuándo aplicar este pattern
- Crear una cuenta nueva
- Alta de cliente (onboarding KYC)
- Registro con datos personales (nombre, apellidos, teléfono, email…)
- Cualquier flujo de captación de datos para crear un nuevo usuario o perfil

## Nivel de navegación
L2 — siempre se accede desde login o onboarding

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Modal (L2)
2. input-text × N — tantos campos como indique el brief (mínimo 2, máximo 5)
3. button-primary — label: "Crear cuenta" / "Registrarme" / "Continuar"

## Componentes opcionales
- button-secondary — label: "Ya tengo cuenta" / "Cancelar"
- notification-banner — variant: info | para requisitos del formulario
- notification-banner — variant: error | para errores de validación

## Reglas de composición
- El número de input-text se infiere del brief — no es fijo
- Orden lógico: nombre → apellidos → email → teléfono → contraseña
- button-primary siempre al final
- Si hay más de 5 campos, dividir en pantallas (formulario multipaso)

## Reglas de contenido
- Cada input-text con label específico según el campo real
- button-primary.label indica creación, no genérico
- Si hay contraseña, añadir helper_text con requisitos

## Incompatibilidades
- No usar filter-bar
- No usar card-item
- No usar tab-bar (L2)

## Composition pattern
Usa: composition-patterns/form-block.md

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)
