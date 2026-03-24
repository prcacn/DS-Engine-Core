# Confirmación de acción
**pattern:** confirmacion
**status:** APPROVED
**score:** 0.90
**domain:** confirmacion
**fecha:** 2026-03-24
**nav_level:** L3
**match_keywords:** confirmar, confirmación, seguro, cancelar, eliminar, enviar, irreversible

## Descripción
Modal de confirmación de acción importante o irreversible. Siempre L3 — nunca
tiene tab-bar. La IA puede adaptar los textos pero no la estructura (PSD2).

## Slots

### header
- navigation-header (variant: Type=Modal, title: "")
  - ai_overridable: title

### content
- modal-bottom-sheet (variant: confirmation)
  - ai_overridable: title, description, confirm_label, cancel_label
  - default_props: { title: "¿Confirmar acción?", description: "Esta acción no se puede deshacer", confirm_label: "Confirmar", cancel_label: "Cancelar" }

### bottom
  - (vacío — el modal ocupa el área bottom)

## Componentes
- navigation-header (variant: Type=Modal, title: "")
- modal-bottom-sheet (variant: confirmation)

## Notas de aprobación
Obligatoria para cualquier acción destructiva o irreversible. No añadir
más componentes — la simplicidad es intencional. El confirm_label debe
incluir el objeto de la acción: "Eliminar cuenta", "Enviar 250 €".
