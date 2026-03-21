# composition-patterns / form-block
## Descripción
Bloque reutilizable de formulario. Define cómo se construye un grupo de campos
input-text con su CTA. Lo usan los patrones registro, edicion-perfil y formulario-producto.

## Qué resuelve
El número de campos no es fijo — lo determina el brief. Este bloque delega
esa decisión al engine en lugar de hardcodearla en el patrón.

## Estructura
```
input-text × N   (N = campos detectados en el brief, mínimo 1, máximo 5)
button-primary   (siempre al final del bloque)
```

## Reglas de instanciación
- El engine cuenta los campos mencionados en el brief (nombre, apellidos, email, teléfono...)
- Si el brief no especifica campos concretos, usar 2 como mínimo razonable
- Máximo 5 campos por bloque — más de 5 requiere multipaso
- El orden de los campos sigue la lógica conversacional: identificación → contacto → credencial

## Orden recomendado de campos por dominio
| Dominio | Orden de campos |
|---|---|
| Registro general | nombre → apellidos → email → teléfono → contraseña |
| KYC financiero | nombre → apellidos → fecha nacimiento → DNI/NIF → teléfono |
| Contacto | nombre → email → mensaje |
| Acceso | email/teléfono → contraseña/PIN |
| Dirección | calle → número → ciudad → código postal → país |

## Reglas de contenido
- Cada input-text con label específico — nunca "Campo 1", "Campo 2"
- Campos requeridos marcados con required: true
- Campos sensibles (contraseña, DNI) con helper_text explicativo

## Quién lo usa
- registro.md
- edicion-perfil.md
- formulario-producto.md
- formulario-default.md (como fallback)

## No usar en
- login.md — estructura fija, no necesita form-block
- transferencia-bancaria — tiene su propio flujo multipantalla
