# Nivel L3 — Confirmation / Result (Confirmación o Resultado)

## IDENTIFICACIÓN
- **Nivel:** L3
- **Nombre:** Confirmation / Result
- **Node ID Figma:** `170:2792`
- **Página Figma:** Pattern Navigation
- **Dimensiones:** 390 × 844px
- **Fondo:** `#F1F5F9` (neutral/300)

## DESCRIPCIÓN
Pantalla de confirmación de una acción o resultado de un flujo. Es el último paso antes de ejecutar algo irreversible, o la pantalla que muestra el resultado de haberlo ejecutado. Siempre tiene doble CTA (confirmar + cancelar) en una zona de acciones fija en la parte inferior. Nunca debe omitirse en flujos financieros.

## ESTRUCTURA VISUAL
```
┌─────────────────────────────────────────────────────────┐
│  [navigation-header]                          64px      │
│                    Título de acción        ✕ cerrar     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              Resumen / Resultado de la acción           │
│              (datos, importe, destinatario...)          │
│                                                         │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [Actions zone]                    padding: 16px/12px   │
│  ┌─────────────────────────────────────────────────┐   │
│  │           [button-primary]  48px                │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │          [button-secondary]  48px               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## COMPONENTES (ORDEN EXACTO)

| Orden | Componente | Node ID | Posición | Altura | Notas |
|-------|------------|---------|----------|--------|-------|
| 0 | navigation-header | `170:2825` | top: 0 | 64px | Sin botón izquierdo. **✕ li:x** a la derecha (cerrar). Título centrado |
| 1 | Contenido / Resumen | — | bajo header | libre | Datos de la operación, resultado, resumen |
| 2 | Actions zone | `170:2794` | bottom: 0 | 142px | Frame vertical. Padding: 16px top/bottom · 12px left/right · gap: 14px |
| 3 | button-primary | `170:2795` | dentro de Actions | 48px | CTA principal: "Confirmar [acción]". Color: `rgb(79,70,229)`. Ancho: 366px |
| 4 | button-secondary | `170:2796` | dentro de Actions | 48px | CTA secundario: "Cancelar". Fondo blanco. Color texto: `rgb(79,70,229)`. Ancho: 366px |

## ACTIONS ZONE — LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | VERTICAL |
| Padding top | 16px |
| Padding bottom | 16px |
| Padding left/right | 12px |
| Gap entre botones | 14px |
| Altura total | 142px |
| Posición | Absoluta, pegada al fondo del frame |

## DIFERENCIAS CLAVE RESPECTO A L2

| Aspecto | L2 | L3 |
|---------|----|----|
| Botón izquierdo header | ← arrow-left | **Sin botón izquierdo** |
| Botón derecho header | ⋮ more-vertical | **✕ li:x (cerrar)** |
| CTAs | Solo 1 (primary) | **2: primary + secondary** |
| Zona de acciones | No definida | **Actions zone fija 142px** |
| Propósito | Acción / Detalle | **Confirmación / Resultado** |

## LAYOUT

| Propiedad | Valor |
|-----------|-------|
| Direction | NONE (posicionamiento absoluto) |
| Fondo | `#F1F5F9` — neutral/300 |
| Ancho | 390px |
| Alto | 844px |

## REGLAS DE NIVEL L3

- `navigation-header` con **✕ cerrar** a la derecha — nunca con botón de volver normal
- **Doble CTA siempre obligatorio**: button-primary (confirmar) + button-secondary (cancelar)
- La **Actions zone** es fija al fondo — nunca scrollable
- `tab-bar` NO incluir
- El resumen DEBE mostrar los datos clave antes del CTA (regla KB — error Q1 2023)
- El label del `button-primary` SIEMPRE descriptivo: "Confirmar transferencia", nunca "OK"
- Altura del navigation-header: **64px** (igual que L2)

## NAVEGACIÓN DESDE L3

| Acción | Destino | Nivel |
|--------|---------|-------|
| Tap en ✕ cerrar | Cancela el flujo → Dashboard | → L0 |
| Tap en button-primary | Ejecuta la acción → Resultado | → L3 (resultado) o L0 |
| Tap en button-secondary | Cancela → Pantalla anterior | → L2 |
