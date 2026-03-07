/**
 * POST /figma/paint
 * Receives a compositionPlan from the engine and paints it in Figma
 * using the Figma Plugin API via Desktop Bridge.
 *
 * Returns: { ok, screenId, figmaUrl, nodeId, components }
 */

const express = require('express');
const router = express.Router();

const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY || 'aMiE3zUmsF6QtqycDarsqi';
const FIGMA_PLUGIN_URL = process.env.FIGMA_PLUGIN_URL || 'http://localhost:3002'; // Desktop Bridge

// Component Node IDs in the DS Simple file
const COMPONENT_NODE_IDS = {
  'navigation-header':    '1:3',
  'button-primary':       '1:9',
  'button-secondary':     '1:11',
  'card-item':            '1:13',
  'input-text':           '1:21',
  'filter-bar':           '1:24',
  'empty-state':          '1:31',
  'modal-bottom-sheet':   '1:36',
};

// Component heights for layout
const COMPONENT_HEIGHTS = {
  'navigation-header':   56,
  'filter-bar':          48,
  'card-item':           72,
  'input-text':          72,  // with label
  'button-primary':      64,  // with padding
  'button-secondary':    64,
  'empty-state':        255,
  'modal-bottom-sheet': 257,
};

router.post('/paint', async (req, res) => {
  try {
    const { compositionPlan } = req.body;

    if (!compositionPlan) {
      return res.status(400).json({ error: 'MissingBody', message: 'compositionPlan is required' });
    }

    const { screen_id, pattern, brief, components, status, confidence } = compositionPlan;

    if (!components || !Array.isArray(components)) {
      return res.status(400).json({ error: 'InvalidPlan', message: 'components array is required' });
    }

    // Build the plugin script to execute
    const paintScript = buildPaintScript({ screen_id, pattern, brief, components, status, confidence });

    // Execute via Desktop Bridge
    const result = await executeInFigma(paintScript);

    if (!result.ok) {
      return res.status(500).json({
        error: 'FigmaError',
        message: result.error || 'Failed to paint in Figma',
        detail: result
      });
    }

    return res.json({
      ok: true,
      screenId: result.screenId,
      nodeId: result.nodeId,
      figmaUrl: `https://www.figma.com/design/${FIGMA_FILE_KEY}?node-id=${result.nodeId.replace(':', '-')}`,
      pattern,
      brief,
      status,
      confidence: confidence?.global,
      components: components.map(c => c.component),
    });

  } catch (err) {
    console.error('[figma/paint] Error:', err.message);
    res.status(500).json({
      error: 'InternalError',
      message: err.message,
    });
  }
});

/**
 * Builds the JS script to execute in Figma plugin context
 */
function buildPaintScript({ screen_id, pattern, brief, components, status, confidence }) {
  const score = Math.round((confidence?.global || 0) * 100);
  const componentList = JSON.stringify(components);
  const nodeIds = JSON.stringify(COMPONENT_NODE_IDS);
  const heights = JSON.stringify(COMPONENT_HEIGHTS);

  return `
    (async () => {
      const page = figma.currentPage;
      const COMPONENT_NODE_IDS = ${nodeIds};
      const COMPONENT_HEIGHTS = ${heights};
      const components = ${componentList};

      // Find rightmost position
      let maxX = 0;
      page.children.forEach(n => {
        if (n.x + (n.width || 0) > maxX) maxX = n.x + (n.width || 0);
      });
      const startX = maxX + 80;

      // Create screen frame (390×844 — standard mobile)
      const screen = figma.createFrame();
      screen.name = "${screen_id} / ${pattern}";
      screen.resize(390, 844);
      screen.x = startX;
      screen.y = 0;
      screen.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.98, b: 0.99 } }];
      screen.clipsContent = true;

      await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      await figma.loadFontAsync({ family: "Inter", style: "Bold" });

      // Label above frame: screen ID + status
      const label = figma.createText();
      label.fontName = { family: "Inter", style: "Regular" };
      label.characters = "${screen_id}  ·  ${pattern}  ·  ${status}  ${score}%";
      label.fontSize = 11;
      label.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.44, b: 0.5 } }];
      label.x = startX;
      label.y = -20;
      page.appendChild(label);

      // Annotation: brief
      const briefNote = figma.createText();
      briefNote.fontName = { family: "Inter", style: "Regular" };
      briefNote.characters = '"${brief}"';
      briefNote.fontSize = 10;
      briefNote.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.63, b: 0.68 } }];
      briefNote.x = startX;
      briefNote.y = -36;
      page.appendChild(briefNote);

      // Paint components in order
      let currentY = 0;

      for (const comp of components) {
        const nodeId = COMPONENT_NODE_IDS[comp.component];
        if (!nodeId) continue;

        try {
          const componentNode = await figma.getNodeByIdAsync(nodeId);
          if (!componentNode || componentNode.type !== 'COMPONENT') continue;

          const instance = componentNode.createInstance();
          instance.name = String(comp.order).padStart(2, '0') + ' / ' + comp.component;
          instance.x = 0;
          instance.y = currentY;
          instance.resize(390, COMPONENT_HEIGHTS[comp.component] || 56);
          screen.appendChild(instance);

          currentY += COMPONENT_HEIGHTS[comp.component] || 56;

          // Governance annotation for non-required components
          if (!comp.required) {
            const opt = figma.createText();
            opt.fontName = { family: "Inter", style: "Regular" };
            opt.characters = "optional";
            opt.fontSize = 9;
            opt.fills = [{ type: 'SOLID', color: { r: 0.6, g: 0.6, b: 0.6 } }];
            opt.x = 396;
            opt.y = currentY - (COMPONENT_HEIGHTS[comp.component] || 56) + 4;
            screen.appendChild(opt);
          }
        } catch (e) {
          // Skip component silently if not found
        }
      }

      // Governance badge overlay (bottom of screen)
      const badge = figma.createFrame();
      badge.name = "_governance";
      badge.resize(390, 28);
      badge.x = 0;
      badge.y = 816;
      badge.fills = [{ type: 'SOLID', color: { r: 0.04, g: 0.05, b: 0.07 }, opacity: 0.7 }];
      screen.appendChild(badge);

      const badgeText = figma.createText();
      badgeText.fontName = { family: "Inter", style: "Regular" };
      badgeText.characters = "DS Engine · Auto-generated · ${score}% confidence · ${status}";
      badgeText.fontSize = 9;
      badgeText.fills = [{ type: 'SOLID', color: { r: 0.85, g: 0.87, b: 0.9 } }];
      badgeText.x = 8;
      badgeText.y = 8;
      screen.appendChild(badgeText);

      figma.viewport.scrollAndZoomIntoView([screen]);

      return {
        ok: true,
        screenId: screen.id,
        nodeId: screen.id,
      };
    })()
  `;
}

/**
 * Execute script via Figma Desktop Bridge
 * The bridge runs on localhost:3002 (Figma plugin server)
 */
async function executeInFigma(script) {
  try {
    const response = await fetch(FIGMA_PLUGIN_URL + '/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: script }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const text = await response.text();
      return { ok: false, error: `Bridge HTTP ${response.status}: ${text}` };
    }

    const data = await response.json();
    return data?.result || data;

  } catch (err) {
    // Bridge not available — return mock for dev mode
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[figma/paint] Bridge unavailable, returning mock response');
      return {
        ok: true,
        screenId: 'mock:' + Date.now(),
        nodeId: 'mock:' + Date.now(),
        _mock: true,
      };
    }
    return { ok: false, error: 'Bridge unreachable: ' + err.message };
  }
}

module.exports = router;
