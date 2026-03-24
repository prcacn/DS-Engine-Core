# Contenido con media cards
**pattern:** lista-con-filtros
**status:** APPROVED
**score:** 0.86
**domain:** contenido
**fecha:** 2026-03-24
**nav_level:** L2
**match_keywords:** card-media, media, contenido, noticias, artículos, fondos destacados, promociones, cards de contenido

## Descripción
Pantalla de contenido editorial con cards visuales (imagen + texto). Usa card-media
en sus tres variantes: vertical para fondos/productos, horizontal para noticias,
no-media para promociones. L2 — accesible desde listado L1.

## Slots

### header
- navigation-header (variant: Type=Modal, title: "Contenido")
  - ai_overridable: title

### content
- card-media ×3
  - ai_overridable: quantity (min: 1, max: 10)
  - default_props: { layout: "vertical", category: "Categoría", title: "Título del contenido" }

### bottom
  - (sin tab-bar — es L2)

## Componentes
- navigation-header (variant: Type=Modal, title: "Contenido")
- card-media ×3

## Notas de aprobación
Template base para cualquier pantalla de contenido editorial con card-media.
Variantes: noticias (layout=horizontal), fondos destacados (layout=vertical),
promociones (layout=no-media).
