// core/kbGovernance.js
// Aplica reglas de la Knowledge Base sobre la composición generada.
// Es la red de seguridad final — actúa después de los agentes.

// ─── SUSTITUCIÓN FINANCIERA ────────────────────────────────────────────────
// ─── APPLY KB RULES ──────────────────────────────────────────────────────────
// Lee las reglas KB recuperadas (ds-pattern y restriccion) y las aplica
// directamente sobre la lista de componentes:
//   - Si una regla menciona "añadir X" o "incluir X" → añade el componente
//   - Si una regla menciona "no usar X" o "eliminar X" → lo elimina
//   - Si una regla menciona "reemplazar X por Y" → hace el swap
//
// Solo actúa sobre reglas de alta o media prioridad para evitar ruido.

const KNOWN_COMPONENTS = [
  'navigation-header', 'button-primary', 'button-secondary', 'card-item',
  'input-text', 'filter-bar', 'empty-state', 'modal-bottom-sheet',
  'tab-bar', 'list-header', 'badge', 'notification-banner',
  'amount-display', 'chart-sparkline', 'skeleton-loader',
  'card-summary', 'card-item/account',
];

function applyKBRules(components, kbRules, intent) {
  if (!kbRules || kbRules.length === 0) return { components, kb_changes: [] };

  var result = components.slice(); // copia
  var kb_changes = [];

  var ACTIONABLE_CATS = ['ds-pattern', 'restriccion'];
  var SKIP_PRIORITIES = ['baja'];

  var actionable = kbRules.filter(function(r) {
    return ACTIONABLE_CATS.indexOf(r.categoria || r.tipo || '') !== -1
        && SKIP_PRIORITIES.indexOf(r.prioridad || '') === -1;
  });

  actionable.forEach(function(rule) {
    var text = (rule.content || rule.text || '').toLowerCase();

    KNOWN_COMPONENTS.forEach(function(comp) {
      var compInPlan = result.some(function(c) { return c.component === comp; });

      // ── AÑADIR ──────────────────────────────────────────────────────────────
      var addPatterns = [
        'siempre incluir ' + comp,
        'incluir ' + comp,
        'añadir ' + comp,
        'usar ' + comp,
        'debe tener ' + comp,
        'requiere ' + comp,
        comp + ' es obligatorio',
        comp + ' siempre',
      ];
      var shouldAdd = addPatterns.some(function(p) { return text.includes(p); });

      if (shouldAdd && !compInPlan) {
        var newComp = {
          component: comp,
          order: result.length + 1,
          required: true,
          variant: 'default',
          props: {},
          node_id: null,
          kb_injected: true,
          kb_rule_id: rule.id || null,
        };
        result.push(newComp);
        kb_changes.push({ type: 'añadido', component: comp, reason: text.slice(0, 80) });
        console.log('  → [KB] añadido ' + comp + ' por regla: ' + text.slice(0, 60));
      }

      // ── ELIMINAR ─────────────────────────────────────────────────────────────
      var removePatterns = [
        'no usar ' + comp,
        'nunca usar ' + comp,
        'evitar ' + comp,
        'no incluir ' + comp,
        'eliminar ' + comp,
        'prohibido ' + comp,
        comp + ' no debe',
        comp + ' nunca',
      ];
      var shouldRemove = removePatterns.some(function(p) { return text.includes(p); });

      if (shouldRemove && compInPlan) {
        result = result.filter(function(c) { return c.component !== comp; });
        kb_changes.push({ type: 'eliminado', component: comp, reason: text.slice(0, 80) });
        console.log('  → [KB] eliminado ' + comp + ' por regla: ' + text.slice(0, 60));
      }
    });

    // ── REEMPLAZAR ───────────────────────────────────────────────────────────
    KNOWN_COMPONENTS.forEach(function(compFrom) {
      KNOWN_COMPONENTS.forEach(function(compTo) {
        if (compFrom === compTo) return;
        var replacePatterns = [
          'reemplazar ' + compFrom + ' por ' + compTo,
          'usar ' + compTo + ' en lugar de ' + compFrom,
          compFrom + ' → ' + compTo,
        ];
        var shouldReplace = replacePatterns.some(function(p) { return text.includes(p); });
        var fromInPlan = result.some(function(c) { return c.component === compFrom; });

        if (shouldReplace && fromInPlan) {
          result = result.map(function(c) {
            if (c.component !== compFrom) return c;
            return Object.assign({}, c, { component: compTo, kb_injected: true });
          });
          kb_changes.push({ type: 'reemplazado', from: compFrom, to: compTo, reason: text.slice(0, 80) });
          console.log('  → [KB] reemplazado ' + compFrom + ' → ' + compTo);
        }
      });
    });
  });

  return { components: result, kb_changes: kb_changes };
}

// ─── A1: DETECCIÓN DE DOMINIO FINTECH (AMPLIADA) ─────────────────────────────
const FINTECH_KEYWORDS = [
  "movimiento", "transaccion", "transacción", "transferencia", "pago", "pagos",
  "ingreso", "gasto", "extracto", "cargo", "abono",
  "fondo", "fondos", "inversion", "inversión", "cartera", "portfolio",
  "saldo", "cuenta", "cuentas", "posicion", "posición",
  "rentabilidad", "rendimiento", "revalorizacion",
  "hipoteca", "prestamo", "préstamo", "credito", "crédito",
  "banca", "bancario", "fintech", "finanzas",
  "retiro", "deposito", "depósito", "ahorro", "ahorros",
  "divisa", "divisas", "mercado",
];

function isFintechDomain(brief, intent) {
  const b = (brief || "").toLowerCase();
  const domain = ((intent && intent.domain) || "").toLowerCase();
  const fintechDomains = ["fondos", "transferencias", "saldo", "transacciones",
    "banca", "fintech", "inversión", "inversion", "cartera", "hipoteca",
    "préstamo", "prestamo", "crédito", "credito", "pagos", "movimientos"];
  if (fintechDomains.some(d => domain.includes(d))) return true;
  return FINTECH_KEYWORDS.some(kw => b.includes(kw));
}

function applyFinancialVariant(components, intent, brief) {
  if (!isFintechDomain(brief, intent)) return components;
  const contracts = loadContracts();
  const financialContract = contracts["card-item/financial"];
  if (!financialContract) return components;
  const changed = [];
  const result = components.map(c => {
    if (c.component !== "card-item") return c;
    changed.push(c.slot || c.component);
    return { ...c, component: "card-item/financial", node_id: financialContract.nodeId };
  });
  if (changed.length > 0) {
    console.log("  → [A1] card-item → card-item/financial (" + changed.length + " instancias, dominio fintech)");
  }
  return result;
}



module.exports = { applyKBRules, applyFinancialVariant };
