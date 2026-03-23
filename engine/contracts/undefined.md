# undefined

## Enlace Figma
[Simple — nodo 20:810](https://www.figma.com/design/aMiE3zUmsF6QtqycDarsqi/Simple?node-id=20-810)

## Node ID en Figma
`20:810`

## Descripción
Símbolo de superficie rectangular con esquinas muy redondeadas y relleno gris plano. En el archivo **Simple** aparece con el nombre de capa **Undefined**; actúa como contenedor o base visual mínima (placeholder de superficie), no como pantalla compuesta.

> **Nota:** Si el objetivo era documentar la **pantalla de login** completa (header, campos, botones), el `node-id` enlazado no corresponde a ese frame: apunta a este componente. La composición de login del DS sigue el patrón `formulario-simple` descrito en `patterns/login.md` y en `examples/login-aprobado.md`.

---

## Especificación desde diseño

| Atributo | Valor |
|---|---|
| Tipo en archivo | `COMPONENT` (symbol) |
| Ancho | 390px |
| Alto | 162px |
| Radio de esquina | `radius/xl` → 16px |
| Relleno | `#d9d9d9` |

### Jerarquía de capas (referencia)
- `20:810` — raíz del componente **Undefined**
- `20:809` — rectángulo de fondo (mismo fill y tamaño aparente)

---

## Uso previsto (inferido)
- Base de superficie o bloque previo a contenido real
- No sustituye a patrones de pantalla (`formulario-simple`, `login`, etc.)

---

## Fuente de verdad paralela
Los mismos datos estructurados están en `undefined.yaml` junto a este archivo.
