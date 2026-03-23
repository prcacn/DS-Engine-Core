'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// AGENT ORCHESTRATOR
// Corre UXWriter y UXSpec en paralelo y fusiona sus outputs sobre
// los componentes base del arquitecto.
// ─────────────────────────────────────────────────────────────────────────────

const { runUXWriterAgent } = require('./uxWriterAgent');
const { runUXSpecAgent }   = require('./uxSpecAgent');

async function runAgents({ brief, components, intent, kbRules, contracts }) {
  console.log('  [Agents]   → lanzando UXWriter + UXSpec en paralelo...');

  // ── Correr en paralelo ────────────────────────────────────────────────────
  // Correr en paralelo con fallback individual — si uno falla no bloquea el otro
  const [writerResult, specResult] = await Promise.all([
    runUXWriterAgent({ brief, components, intent, kbRules }).catch(err => {
      console.error('  ✗ [UXWriter] Error:', err.message);
      return { components: components.map(c => ({ component: c.component, order: c.order, copy: {}, writer_note: 'error' })), tone_rationale: 'error' };
    }),
    runUXSpecAgent({ brief, components, intent, kbRules }).catch(err => {
      console.error('  ✗ [UXSpec] Error:', err.message);
      return { components: components.map(c => ({ component: c.component, order: c.order, variant: c.variant || 'default', state: 'active', ux_note: 'error' })), missing_ux_elements: [], flow_rationale: 'error' };
    }),
  ]);

  // ── Fusionar sobre los componentes base ───────────────────────────────────
  const enriched = components.map(base => {
    const writerComp = writerResult.components?.find(
      c => c.component === base.component && c.order === base.order
    );
    const specComp = specResult.components?.find(
      c => c.component === base.component && c.order === base.order
    );

    // Merge: base → spec (variante, estado) → writer (copy/props)
    const merged = { ...base };

    // Del agente Spec: variante y estado
    if (specComp) {
      if (specComp.variant) merged.variant = specComp.variant;
      if (specComp.state)   merged.state   = specComp.state;
      if (specComp.ux_note) merged.ux_note = specComp.ux_note;
    }

    // Del agente Writer: props de texto (se mergean sobre los props existentes)
    if (writerComp && writerComp.copy && Object.keys(writerComp.copy).length > 0) {
      merged.props = { ...(merged.props || {}), ...writerComp.copy };
      merged.writer_note = writerComp.writer_note;
    }

    merged.agent_enriched = true;
    return merged;
  });

  // ── Añadir elementos sugeridos por UXSpec que no existen aún ─────────────
  const missing = specResult.missing_ux_elements || [];
  const extraComponents = [];

  missing.forEach(function(m) {
    const alreadyExists = enriched.some(c => c.component === m.component);
    if (!alreadyExists && contracts[m.component]) {
      const contract = contracts[m.component];
      extraComponents.push({
        slot:       m.component,
        component:  m.component,
        order:      m.suggested_order || (enriched.length + extraComponents.length + 1),
        required:   false,
        variant:    'default',
        state:      'active',
        props:      {},
        node_id:    contract.nodeId,
        resolution_confidence: 0.70,
        agent_enriched: true,
        agent_suggested: true,
        ux_note:    m.reason,
      });
    }
  });

  // Combinar y re-ordenar
  const allComponents = [...enriched, ...extraComponents]
    .sort((a, b) => a.order - b.order)
    .map((c, i) => ({ ...c, order: i + 1 }));

  return {
    components: allComponents,
    agent_meta: {
      writer_tone:    writerResult.tone_rationale  || '—',
      spec_flow:      specResult.flow_rationale    || '—',
      suggested_added: extraComponents.length,
    },
  };
}

module.exports = { runAgents };
