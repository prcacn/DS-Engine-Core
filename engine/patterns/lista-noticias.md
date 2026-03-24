# lista-noticias

## Descripción
Pantalla de listado de noticias, artículos o contenido editorial con imagen destacada.
Usa card-composition variante card-media para cada ítem — imagen + titular + enlace.

## Cuándo aplicar este pattern
- Noticias financieras, artículos del blog, novedades del producto
- Cuando el brief mencione: noticias, artículos, contenido, publicaciones, posts
- Cuando cada ítem tiene imagen + texto + enlace o acción
- Listados editoriales donde la imagen es parte del contenido

## Componentes requeridos (en este orden)
1. navigation-header — variant: Type=Predeterminada (L1)
2. card-composition × N — variant: card-media — con imagen, titular y enlace
3. empty-state — CONDICIONAL: solo si no hay noticias

## Componentes opcionales
- filter-bar — si hay categorías de noticias (ej: Mercados, Empresa, Economía)
- tab-bar — siempre en L1

## Reglas de composición
- Cada card-composition tiene 3 slots: header (titular), content (imagen+texto), action (enlace)
- El slot action usa variant link con label "Leer más →"
- El slot header lleva el titular de la noticia (title)
- El slot content lleva imagen + resumen (image+text)
- Mínimo 1 noticia, máximo 10 en primera carga

## Reglas de contenido
- navigation-header title: nombre de la sección (ej: "Noticias", "Actualidad")
- card-composition header.title: titular de la noticia
- card-composition content.text: resumen corto (máx 80 chars)
- card-composition action.link_label: "Leer más →"

## Ejemplos aprobados
(vacío — se irán añadiendo en /examples)

## Incompatibilidades
- No usar card-item en esta pantalla — usar siempre card-composition
