// core/screenRenderer.js - Screen Renderer v1.0
// Convierte un array de componentes del engine en HTML semántico
// con CSS variables del Simple DS. Listo para producción.
//
// FILOSOFÍA:
//   - Todo el HTML se genera aquí, en el servidor
//   - Los clientes (webapp, plugin, API) solo muestran lo que reciben
//   - Los tokens vienen del DS - nunca valores hardcodeados en el HTML
//   - El output es portable: funciona en cualquier proyecto que importe los tokens
//
// TOKENS del Simple DS (de Figma):
//   --ds-color-text-primary:    #0f172a   (Text/Default/Default)
//   --ds-color-text-secondary:  #475569   (Text/Default/Secondary)
//   --ds-color-text-neutral:    #64748b   (Text/Neutral/Default)
//   --ds-color-text-inverse:    #ffffff   (Text/Default/nochange)
//   --ds-color-bg:              #ffffff   (Background/Default/Default)
//   --ds-color-brand:           #4f46e5   (Background/Brand/Default)
//   --ds-color-border:          #e2e8f0   (Border/Default/Default)
//   --ds-color-border-subtle:   #f1f5f9   (Border/Default/Subtle)
//   --ds-font:                  'DM Sans', sans-serif
//   --ds-text-heading:          16px / 600
//   --ds-text-body-strong:      14px / 500
//   --ds-text-body:             14px / 400
//   --ds-text-caption:          12px / 400
//   --ds-text-label:            12px / 400
//   --ds-gap-xs:                2px   (Gap/XS)
//   --ds-gap-md:                8px   (Size/8)
//   --ds-gap-xl:                16px  (Gap/XL)
//   --ds-pad-h:                 16px  (Padding/Horizontal/MD)
//   --ds-pad-v-sm:              8px   (Padding/Vertical/SM)
//   --ds-pad-v-md:              12px  (Padding/Vertical/MD)
//   --ds-radius-xs:             4px   (Radius/Component/XS)
//   --ds-radius-sm:             8px   (Radius/Component/SM)

// ─── CSS BASE - se incluye UNA SOLA VEZ en el documento ──────────────────────

const DS_CSS = `
:root {
  /* Colors - Simple DS tokens */
  --ds-color-text-primary:   #0f172a;
  --ds-color-text-secondary: #475569;
  --ds-color-text-neutral:   #64748b;
  --ds-color-text-inverse:   #ffffff;
  --ds-color-bg:             #ffffff;
  --ds-color-brand:          #4f46e5;
  --ds-color-brand-hover:    #4338ca;
  --ds-color-border:         #e2e8f0;
  --ds-color-border-subtle:  #f1f5f9;
  --ds-color-success:        #16a34a;
  --ds-color-success-bg:     #dcfce7;
  --ds-color-error:          #dc2626;
  --ds-color-error-bg:       #fef2f2;
  --ds-color-warning:        #d97706;
  --ds-color-warning-bg:     #fef9c3;
  --ds-color-info:           #3b82f6;
  --ds-color-info-bg:        #dbeafe;
  /* Typography - Simple DS tokens */
  --ds-font:                 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --ds-size-heading:         16px;
  --ds-weight-heading:       600;
  --ds-size-body-strong:     14px;
  --ds-weight-body-strong:   500;
  --ds-size-body:            14px;
  --ds-weight-body:          400;
  --ds-size-caption:         12px;
  --ds-weight-caption:       400;
  --ds-size-label:           12px;
  --ds-weight-label:         400;
  /* Spacing - Simple DS tokens */
  --ds-gap-xs:    2px;
  --ds-gap-sm:    4px;
  --ds-gap-md:    8px;
  --ds-gap-lg:    12px;
  --ds-gap-xl:    16px;
  --ds-pad-h:     16px;
  --ds-pad-v-sm:  8px;
  --ds-pad-v-md:  12px;
  /* Radii - Simple DS tokens */
  --ds-radius-xs:   4px;
  --ds-radius-sm:   8px;
  --ds-radius-full: 9999px;
  /* Component sizes */
  --ds-height-header:  56px;
  --ds-height-input:   44px;
  --ds-height-button:  48px;
  --ds-height-tab-bar: 56px;
}
/* ── AMOUNT DISPLAY ─────────────────────────── */
.ds-amount-display {
  padding: var(--ds-pad-v-md) var(--ds-pad-h);
  background: var(--ds-color-bg);
}
.ds-amount-label {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
  margin-bottom: 4px;
}
.ds-amount-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  letter-spacing: -0.5px;
}
.ds-amount-sublabel {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-success);
  font-family: var(--ds-font);
  margin-top: 4px;
}

/* ── CHART SPARKLINE ────────────────────────── */
.ds-chart-sparkline {
  padding: 0 var(--ds-pad-h) var(--ds-gap-md);
  background: var(--ds-color-bg);
}
.ds-sparkline-svg { width: 100%; height: 80px; }

/* ── CARD ACCOUNTS ──────────────────────────── */
.ds-card-accounts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: var(--ds-gap-md) var(--ds-pad-h);
  background: var(--ds-color-bg);
}
.ds-card-account {
  background: var(--ds-color-border-subtle);
  border-radius: var(--ds-radius-sm);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ds-account-initials {
  width: 36px; height: 36px;
  border-radius: var(--ds-radius-full);
  background: #e0e7ff;
  color: #4f46e5;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  font-family: var(--ds-font);
}
.ds-account-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  line-height: 1.2;
}
.ds-account-number {
  font-size: 11px;
  color: var(--ds-color-text-neutral);
  font-family: var(--ds-font);
}
.ds-account-balance {
  font-size: 14px;
  font-weight: 600;
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  margin-top: 4px;
}

/* ── MOVEMENTS SET ──────────────────────────── */
.ds-movements-set {
  display: flex;
  flex-direction: column;
  background: var(--ds-color-bg);
  flex: 1;
}
.ds-movements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ds-pad-v-sm) var(--ds-pad-h);
  border-bottom: 1px solid var(--ds-color-border-subtle);
}
.ds-movements-date-label {
  font-size: var(--ds-size-caption);
  font-weight: 600;
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ds-movements-date-right {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
}

/* ── RESET ────────────────────────────────── */
.ds-screen *, .ds-screen *::before, .ds-screen *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.ds-screen {
  display: flex; flex-direction: column;
  background: var(--ds-color-bg);
  font-family: var(--ds-font);
  width: 390px;
  position: relative;
}

/* ── NAVIGATION HEADER ────────────────────── */
.ds-navigation-header {
  display: flex; align-items: center; justify-content: space-between;
  height: var(--ds-height-header);
  padding: 0 var(--ds-pad-h);
  background: var(--ds-color-bg);
  border-bottom: 1px solid var(--ds-color-border-subtle);
  position: sticky; top: 0; z-index: 100;
}
.ds-nav-icon {
  width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center;
  color: var(--ds-color-text-primary); flex-shrink: 0;
}
.ds-nav-title {
  font-size: var(--ds-size-heading);
  font-weight: var(--ds-weight-heading);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
}
.ds-nav-subtitle {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
  margin-top: 1px;
}

/* ── INPUT TEXT ────────────────────────────── */
.ds-form {
  padding: var(--ds-pad-h);
  display: flex; flex-direction: column;
  gap: var(--ds-gap-xl);
  background: var(--ds-color-bg);
}
.ds-input-wrap {
  display: flex; flex-direction: column;
  gap: var(--ds-gap-xs);
}
.ds-input-label {
  font-size: var(--ds-size-caption);
  font-weight: var(--ds-weight-caption);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
}
.ds-input-field {
  background: var(--ds-color-bg);
  border: 1px solid var(--ds-color-border);
  border-radius: var(--ds-radius-xs);
  padding: var(--ds-pad-v-sm) var(--ds-pad-h);
  font-size: var(--ds-size-body);
  color: var(--ds-color-text-neutral);
  font-family: var(--ds-font);
  height: var(--ds-height-input);
  display: flex; align-items: center;
  width: 100%;
}
.ds-input-field.error {
  border-color: var(--ds-color-error);
  background: var(--ds-color-error-bg);
}
.ds-input-helper {
  font-size: 10px;
  color: var(--ds-color-text-neutral);
  font-family: var(--ds-font);
  margin-top: 2px;
}
.ds-input-helper.error { color: var(--ds-color-error); }

/* ── BUTTONS ────────────────────────────────── */
.ds-btn-area {
  padding: 0 var(--ds-pad-h) var(--ds-pad-h);
  display: flex; flex-direction: column;
  gap: var(--ds-gap-md);
  background: var(--ds-color-bg);
}
.ds-btn-primary {
  background: var(--ds-color-brand);
  color: var(--ds-color-text-inverse);
  border: none; border-radius: var(--ds-radius-sm);
  padding: 0 var(--ds-pad-h);
  height: var(--ds-height-button);
  font-size: var(--ds-size-label);
  font-weight: var(--ds-weight-label);
  font-family: var(--ds-font);
  width: 100%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.ds-btn-primary:hover { background: var(--ds-color-brand-hover); }
.ds-btn-primary.destructive { background: var(--ds-color-error); }
.ds-btn-primary.disabled { opacity: 0.45; pointer-events: none; }
.ds-btn-secondary {
  background: var(--ds-color-bg);
  color: var(--ds-color-brand);
  border: 1.5px solid var(--ds-color-brand);
  border-radius: var(--ds-radius-sm);
  padding: 0 var(--ds-pad-h);
  height: var(--ds-height-button);
  font-size: var(--ds-size-label);
  font-weight: var(--ds-weight-label);
  font-family: var(--ds-font);
  width: 100%; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ds-btn-link {
  background: none; border: none;
  color: var(--ds-color-brand);
  font-size: var(--ds-size-caption);
  font-family: var(--ds-font);
  text-decoration: underline; cursor: pointer;
  padding: var(--ds-pad-v-sm) 0;
  text-align: center; width: 100%;
}

/* ── CARD ITEM ─────────────────────────────── */
.ds-card-list { display: flex; flex-direction: column; }
.ds-card-item {
  display: flex; align-items: center;
  padding: var(--ds-pad-v-md) var(--ds-pad-h);
  gap: var(--ds-gap-md);
  background: var(--ds-color-bg);
  border-bottom: 1px solid var(--ds-color-border-subtle);
  cursor: pointer;
}
.ds-card-item:last-child { border-bottom: none; }
.ds-card-avatar {
  width: 40px; height: 40px; border-radius: var(--ds-radius-full);
  background: var(--ds-color-info-bg);
  flex-shrink: 0; display: flex;
  align-items: center; justify-content: center;
  font-size: var(--ds-size-body-strong);
  font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-info);
  font-family: var(--ds-font);
}
.ds-card-body { flex: 1; min-width: 0; }
.ds-card-title {
  font-size: var(--ds-size-body-strong);
  font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ds-card-subtitle {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
  margin-top: var(--ds-gap-xs);
}
.ds-card-right {
  display: flex; flex-direction: column;
  align-items: flex-end; gap: var(--ds-gap-xs);
  flex-shrink: 0;
}
.ds-card-value {
  font-size: var(--ds-size-body-strong);
  font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
}
.ds-card-chevron { color: var(--ds-color-text-neutral); font-size: 12px; }

/* ── BADGE ──────────────────────────────────── */
.ds-badge {
  display: inline-flex; align-items: center;
  padding: 2px 7px; border-radius: var(--ds-radius-full);
  font-size: 10px; font-weight: 600;
  font-family: var(--ds-font); white-space: nowrap;
}
.ds-badge.positive { background: var(--ds-color-success-bg); color: var(--ds-color-success); }
.ds-badge.negative { background: var(--ds-color-error-bg);   color: var(--ds-color-error); }
.ds-badge.neutral  { background: var(--ds-color-border-subtle); color: var(--ds-color-text-secondary); }
.ds-badge.warning  { background: var(--ds-color-warning-bg);  color: var(--ds-color-warning); }

/* ── FILTER BAR ─────────────────────────────── */
.ds-filter-bar {
  display: flex; align-items: center;
  gap: var(--ds-gap-md); padding: var(--ds-pad-v-sm) var(--ds-pad-h);
  overflow-x: auto; background: var(--ds-color-bg);
  border-bottom: 1px solid var(--ds-color-border-subtle);
  scrollbar-width: none;
}
.ds-chip {
  padding: 5px 12px; border-radius: var(--ds-radius-full);
  font-size: var(--ds-size-caption); font-family: var(--ds-font);
  white-space: nowrap; cursor: pointer; flex-shrink: 0;
}
.ds-chip.active {
  background: var(--ds-color-brand); color: var(--ds-color-text-inverse);
}
.ds-chip.default {
  background: var(--ds-color-border-subtle);
  color: var(--ds-color-text-secondary);
  border: 1px solid var(--ds-color-border);
}

/* ── LIST HEADER ────────────────────────────── */
.ds-list-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--ds-pad-v-sm) var(--ds-pad-h);
  background: var(--ds-color-bg);
}
.ds-list-header-title {
  font-size: var(--ds-size-caption);
  font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.ds-list-header-action {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-brand);
  font-family: var(--ds-font);
  cursor: pointer;
}

/* ── NOTIFICATION BANNER ────────────────────── */
.ds-notification-banner {
  display: flex; align-items: flex-start; gap: var(--ds-gap-md);
  padding: var(--ds-pad-v-sm) var(--ds-pad-h);
  border-bottom: 1px solid var(--ds-color-border-subtle);
}
.ds-notification-banner.info    { background: var(--ds-color-info-bg); }
.ds-notification-banner.success { background: var(--ds-color-success-bg); }
.ds-notification-banner.warning { background: var(--ds-color-warning-bg); }
.ds-notification-banner.error   { background: var(--ds-color-error-bg); }
.ds-notification-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; margin-top: 3px;
}
.info    .ds-notification-dot { background: var(--ds-color-info); }
.success .ds-notification-dot { background: var(--ds-color-success); }
.warning .ds-notification-dot { background: var(--ds-color-warning); }
.error   .ds-notification-dot { background: var(--ds-color-error); }
.ds-notification-body { flex: 1; }
.ds-notification-title {
  font-size: var(--ds-size-caption); font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-text-primary); font-family: var(--ds-font);
}
.ds-notification-message {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary); font-family: var(--ds-font);
  margin-top: var(--ds-gap-xs); line-height: 1.4;
}

/* ── EMPTY STATE ────────────────────────────── */
.ds-empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 40px var(--ds-pad-h); gap: var(--ds-gap-xl);
  background: var(--ds-color-bg); text-align: center;
}
.ds-empty-icon { font-size: 40px; }
.ds-empty-title {
  font-size: var(--ds-size-body-strong);
  font-weight: var(--ds-weight-body-strong);
  color: var(--ds-color-text-primary); font-family: var(--ds-font);
}
.ds-empty-desc {
  font-size: var(--ds-size-caption);
  color: var(--ds-color-text-secondary); font-family: var(--ds-font);
  line-height: 1.5; max-width: 240px;
}

/* ── TAB BAR ────────────────────────────────── */
.ds-tab-bar {
  display: flex; width: 100%;
  height: var(--ds-height-tab-bar);
  background: var(--ds-color-bg);
  border-top: 1px solid var(--ds-color-border-subtle);
  position: sticky; bottom: 0;
}
.ds-tab-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px; cursor: pointer;
  font-size: 10px; font-family: var(--ds-font);
  color: var(--ds-color-text-neutral);
}
.ds-tab-item.active { color: var(--ds-color-brand); }
.ds-tab-icon { font-size: 20px; }

/* ── MODAL BOTTOM SHEET ─────────────────────── */
.ds-modal-overlay {
  position: absolute; inset: 0;
  background: rgba(15,23,42,0.4);
  display: flex; align-items: flex-end;
  z-index: 200;
}
.ds-modal {
  width: 100%; background: var(--ds-color-bg);
  border-radius: 20px 20px 0 0;
  padding: 12px var(--ds-pad-h) 32px;
  display: flex; flex-direction: column;
  gap: var(--ds-gap-xl);
}
.ds-modal-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: var(--ds-color-border);
  margin: 0 auto 4px;
}
.ds-modal-icon {
  width: 52px; height: 52px; border-radius: var(--ds-radius-full);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; font-size: 24px;
}
.ds-modal-icon.destructive { background: var(--ds-color-error-bg); }
.ds-modal-icon.default     { background: var(--ds-color-info-bg); }
.ds-modal-title {
  font-size: var(--ds-size-heading);
  font-weight: var(--ds-weight-heading);
  color: var(--ds-color-text-primary);
  font-family: var(--ds-font);
  text-align: center;
}
.ds-modal-desc {
  font-size: var(--ds-size-body);
  color: var(--ds-color-text-secondary);
  font-family: var(--ds-font);
  text-align: center; line-height: 1.5;
}
.ds-modal-actions {
  display: flex; flex-direction: column; gap: var(--ds-gap-md);
}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function prop(props, key, fallback) {
  const v = props && props[key];
  return (v !== undefined && v !== null && String(v).trim()) ? String(v) : fallback;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── COMPONENT RENDERERS ──────────────────────────────────────────────────────

function renderNavigationHeader(comp) {
  const p = comp.props || {};
  const v = (comp.variant || '').toLowerCase();
  const showBack  = v.includes('modal') || v.includes('back') || v.includes('with-back');
  const showClose = v.includes('close') || v.includes('with-close');
  const isDashboard = v.includes('dashboard');

  const leftIcon = showClose
    ? `<div class="ds-nav-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4l12 12M16 4L4 16"/></svg></div>`
    : showBack
    ? `<div class="ds-nav-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4L6 10L12 16"/></svg></div>`
    : `<div class="ds-nav-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="17" y2="6"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="3" y1="14" x2="17" y2="14"/></svg></div>`;

  const rightIcon = `<div class="ds-nav-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="10" cy="5" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="15" r="1.5"/></svg></div>`;

  const bellIcon = `<div class="ds-nav-icon"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6z"/><path d="M8.5 16.5a1.5 1.5 0 0 0 3 0"/></svg></div>`;

  const titleHtml = isDashboard ? '' : `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="ds-nav-title">${escHtml(prop(p, 'title', ''))}</div>
      ${p.subtitle ? `<div class="ds-nav-subtitle">${escHtml(p.subtitle)}</div>` : ''}
    </div>`;

  return `<nav class="ds-navigation-header">
    ${leftIcon}
    ${titleHtml}
    ${isDashboard ? bellIcon : rightIcon}
  </nav>`;
}

function renderInputText(comp) {
  const p = comp.props || {};
  const v = (comp.variant || '').toLowerCase();
  const isErr  = v === 'error';
  const isPass = v === 'password';
  const label  = escHtml(prop(p, 'label', 'Campo'));
  const placeholder = isPass ? '••••••••' : escHtml(prop(p, 'placeholder', 'Introduce el valor...'));
  const helper = p.helper_text ? `<div class="ds-input-helper${isErr ? ' error' : ''}">${escHtml(p.helper_text)}</div>` : '';

  return `<div class="ds-input-wrap">
    <label class="ds-input-label">${label}</label>
    <div class="ds-input-field${isErr ? ' error' : ''}">${placeholder}</div>
    ${helper}
  </div>`;
}

function renderButtonPrimary(comp) {
  const p = comp.props || {};
  const v = (comp.variant || '').toLowerCase();
  const isDestructive = v === 'destructive';
  const isDisabled    = v === 'disabled' || comp.state === 'disabled';
  const label = escHtml(prop(p, 'label', 'Confirmar'));
  return `<div class="ds-btn-area">
    <button class="ds-btn-primary${isDestructive ? ' destructive' : ''}${isDisabled ? ' disabled' : ''}">${label}</button>
  </div>`;
}

function renderButtonSecondary(comp) {
  const p = comp.props || {};
  const label = escHtml(prop(p, 'label', 'Cancelar'));
  return `<div style="padding:0 var(--ds-pad-h) var(--ds-gap-md)">
    <button class="ds-btn-secondary">${label}</button>
  </div>`;
}

function renderCardItem(comp, pattern) {
  const p   = comp.props || {};
  const qty = comp.quantity || 1;
  let html  = '<div class="ds-card-list">';

  // Fallbacks según dominio - se usan solo si los props no tienen valor
  const titles    = ['Nómina Empresa', 'Supermercado', 'Fondo Renta Fija', 'Dividendos', 'Cartera Global'];
  const subtitles = ['15 mar · Transferencia', 'Hoy · Pago', '10 mar · Liquidación', '8 mar · Dividendo', '5 mar · Compra'];
  const values    = ['+€2.450,00', '-€87,50', '+€1.200,00', '+€320,00', '+€5.800,00'];

  for (let i = 0; i < qty; i++) {
    // Usar props reales del engine si existen; fallback a datos de ejemplo
    const title    = escHtml(p.title    || titles[i % titles.length]);
    const subtitle = escHtml(p.subtitle || subtitles[i % subtitles.length]);
    const value    = p.value ? escHtml(p.value) : values[i % values.length];
    const isPos    = value.includes('+');
    const valueColor = isPos ? 'color:var(--ds-color-success)' : value.includes('-') ? 'color:var(--ds-color-error)' : 'color:var(--ds-color-text-primary)';
    const initial  = title.charAt(0).toUpperCase();
    const showValue = Boolean(p.value || !['lista-noticias'].includes(pattern));

    html += `<div class="ds-card-item">
      <div class="ds-card-avatar">${initial}</div>
      <div class="ds-card-body">
        <div class="ds-card-title">${title}</div>
        <div class="ds-card-subtitle">${subtitle}</div>
      </div>
      ${showValue ? `<div class="ds-card-right">
        <div class="ds-card-value" style="${valueColor}">${value}</div>
        <div class="ds-card-chevron">›</div>
      </div>` : '<div class="ds-card-chevron" style="margin-left:auto">›</div>'}
    </div>`;
  }

  return html + '</div>';
}

function renderFilterBar(comp) {
  const p = comp.props || {};
  const filters = Array.isArray(p.filters) ? p.filters : ['Todos', 'Categoría', 'Tipo'];
  const chipsHtml = filters.map((f, i) =>
    `<div class="ds-chip ${i === 0 ? 'active' : 'default'}">${escHtml(f)}</div>`
  ).join('');
  return `<div class="ds-filter-bar">${chipsHtml}</div>`;
}

function renderListHeader(comp) {
  const p = comp.props || {};
  const title  = escHtml(prop(p, 'title', 'Sección'));
  const action = p.action_label ? `<span class="ds-list-header-action">${escHtml(p.action_label)}</span>` : '';
  return `<div class="ds-list-header">
    <span class="ds-list-header-title">${title}</span>
    ${action}
  </div>`;
}

function renderNotificationBanner(comp) {
  const p = comp.props || {};
  const v     = (comp.variant || 'info').toLowerCase();
  const title = p.title   ? `<div class="ds-notification-title">${escHtml(p.title)}</div>` : '';
  const msg   = p.message ? `<div class="ds-notification-message">${escHtml(p.message)}</div>` : '';
  return `<div class="ds-notification-banner ${v}">
    <div class="ds-notification-dot"></div>
    <div class="ds-notification-body">${title}${msg}</div>
  </div>`;
}

function renderEmptyState(comp) {
  const p = comp.props || {};
  const v = (comp.variant || 'default').toLowerCase();
  const icons = { locked: '🔒', error: '⚠️', 'no-results': '🔍', cta: '✨', default: '📭' };
  const icon  = icons[v] || '📭';
  const title = escHtml(prop(p, 'title', 'Sin resultados'));
  const desc  = escHtml(prop(p, 'description', 'No hay elementos que mostrar.'));
  const cta   = p.action_label
    ? `<button class="ds-btn-primary" style="max-width:200px">${escHtml(p.action_label)}</button>`
    : '';
  return `<div class="ds-empty-state">
    <div class="ds-empty-icon">${icon}</div>
    <div class="ds-empty-title">${title}</div>
    <div class="ds-empty-desc">${desc}</div>
    ${cta}
  </div>`;
}

function renderTabBar(comp) {
  const p = comp.props || {};
  const tabs = Array.isArray(p.tabs) ? p.tabs : ['Inicio', 'Mercado', 'Cartera', 'Perfil'];
  const icons = ['⬡', '◈', '◉', '⊙'];
  const tabsHtml = tabs.map((t, i) =>
    `<div class="ds-tab-item${i === 0 ? ' active' : ''}">
      <span class="ds-tab-icon">${icons[i % icons.length]}</span>
      <span>${escHtml(t)}</span>
    </div>`
  ).join('');
  return `<div class="ds-tab-bar">${tabsHtml}</div>`;
}

function renderModalBottomSheet(comp) {
  const p = comp.props || {};
  const v = (comp.variant || 'default').toLowerCase();
  const isDestructive = v === 'destructive' || v === 'confirmation';
  const icon     = isDestructive ? '⚠️' : 'ℹ️';
  const title    = escHtml(prop(p, 'title',         isDestructive ? 'Confirmar acción' : 'Información'));
  const desc     = escHtml(prop(p, 'description',   isDestructive ? 'Esta acción es irreversible.' : ''));
  const confirm  = escHtml(prop(p, 'confirm_label', isDestructive ? 'Confirmar' : 'Aceptar'));
  const cancel   = escHtml(prop(p, 'cancel_label',  'Cancelar'));
  return `<div class="ds-modal-overlay">
    <div class="ds-modal">
      <div class="ds-modal-handle"></div>
      <div class="ds-modal-icon ${isDestructive ? 'destructive' : 'default'}">${icon}</div>
      <div>
        <div class="ds-modal-title">${title}</div>
        ${desc ? `<div class="ds-modal-desc">${desc}</div>` : ''}
      </div>
      <div class="ds-modal-actions">
        <button class="ds-btn-primary${isDestructive ? ' destructive' : ''}">${confirm}</button>
        <button class="ds-btn-secondary">${cancel}</button>
      </div>
    </div>
  </div>`;
}


function renderAmountDisplay(comp) {
  const p = comp.props || {};
  const label    = escHtml(prop(p, 'label',    'Saldo total'));
  const amount   = escHtml(prop(p, 'amount',   '0,00'));
  const currency = escHtml(prop(p, 'currency', '€'));
  const sublabel = escHtml(prop(p, 'sublabel', ''));
  return `<div class="ds-amount-display">
    <div class="ds-amount-label">${label}</div>
    <div class="ds-amount-value">${currency}${amount}</div>
    ${sublabel ? `<div class="ds-amount-sublabel">${sublabel}</div>` : ''}
  </div>`;
}

function renderChartSparkline(comp) {
  return `<div class="ds-chart-sparkline">
    <svg class="ds-sparkline-svg" viewBox="0 0 358 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#4f46e5" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M0 65 C30 60 50 55 80 50 C110 45 130 42 160 38 C190 34 210 30 240 26 C270 22 300 20 330 16 L358 14 L358 80 L0 80 Z" fill="url(#sg)"/>
      <path d="M0 65 C30 60 50 55 80 50 C110 45 130 42 160 38 C190 34 210 30 240 26 C270 22 300 20 330 16 L358 14" stroke="#4f46e5" stroke-width="2" stroke-linecap="round"/>
      <text x="0" y="76" font-size="10" fill="#94a3b8" font-family="DM Sans, sans-serif">Ene</text>
      <text x="140" y="76" font-size="10" fill="#94a3b8" font-family="DM Sans, sans-serif">Feb</text>
      <text x="290" y="76" font-size="10" fill="#94a3b8" font-family="DM Sans, sans-serif">Mar</text>
    </svg>
  </div>`;
}

function renderCardAccounts(components) {
  const cards = components.map(comp => {
    const p = comp.props || {};
    const name    = escHtml(prop(p, 'account-name', 'Cuenta'));
    const number  = escHtml(prop(p, 'account-number', '•••• 0000'));
    const balance = escHtml(prop(p, 'balance', '0,00 €'));
    const parts   = name.toUpperCase().split(' ');
    const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].substring(0, 2);
    return `<div class="ds-card-account">
      <div class="ds-account-initials">${initials}</div>
      <div class="ds-account-name">${name}</div>
      <div class="ds-account-number">${number}</div>
      <div class="ds-account-balance">${balance}</div>
    </div>`;
  }).join('');
  return `<div class="ds-card-accounts-grid">${cards}</div>`;
}

function renderMovementsSet(comp) {
  const p = comp.props || {};
  const headerTitle = escHtml(prop(p, 'header_title', 'Hoy'));
  const headerDate  = escHtml(prop(p, 'header_date',  ''));
  const movements = [
    { name: 'Nómina Empresa',        sub: '15 mar · Transferencia',    value: '+€2.450,00', pos: true },
    { name: 'Supermercado El Corte', sub: '16 mar · Tarjeta •4521', value: '-€87,50',    pos: false },
    { name: 'Netflix',               sub: '16 mar · Suscripción',    value: '-€15,99',    pos: false },
  ];
  const rows = movements.map(m => {
    const initial  = m.name.charAt(0);
    const valColor = m.pos ? 'color:var(--ds-color-success)' : 'color:var(--ds-color-error)';
    const avatarBg = m.pos ? 'background:#dcfce7;color:#16a34a' : 'background:#fef2f2;color:#dc2626';
    return `<div class="ds-card-item">
      <div class="ds-card-avatar" style="${avatarBg}">${initial}</div>
      <div class="ds-card-body">
        <div class="ds-card-title">${escHtml(m.name)}</div>
        <div class="ds-card-subtitle">${escHtml(m.sub)}</div>
      </div>
      <div class="ds-card-right">
        <div class="ds-card-value" style="${valColor}">${escHtml(m.value)}</div>
      </div>
    </div>`;
  }).join('');
  return `<div class="ds-movements-set">
    <div class="ds-movements-header">
      <span class="ds-movements-date-label">${headerTitle}</span>
      ${headerDate ? `<span class="ds-movements-date-right">${headerDate}</span>` : ''}
    </div>
    <div class="ds-card-list">${rows}</div>
  </div>`;
}

// ─── RENDER SCREEN - punto de entrada ────────────────────────────────────────

function renderScreen(data, options = {}) {
  const {
    withCSS     = true,   // incluir el bloque <style> con DS_CSS
    target      = 'html', // 'html' | 'preview' (solo el inner HTML)
    wrapperClass = 'ds-screen',
  } = options;

  const components = data.components || [];
  const pattern    = data.pattern    || '';

  // Separar modal del resto
  const modal      = components.find(c => c.component === 'modal-bottom-sheet');
  const mainComps  = components.filter(c => c.component !== 'modal-bottom-sheet');

  // Agrupar inputs consecutivos (y list-headers) en un ds-form
  const segments = [];
  let i = 0;
  while (i < mainComps.length) {
    const comp = mainComps[i];
    const isFormComp = ['input-text', 'list-header'].includes(comp.component);
    if (isFormComp) {
      const group = [];
      while (i < mainComps.length && ['input-text', 'list-header', 'notification-banner'].includes(mainComps[i].component)) {
        group.push(mainComps[i]);
        i++;
      }
      segments.push({ type: 'form', items: group });
    } else {
      segments.push({ type: 'single', comp });
      i++;
    }
  }

  // Reagrupar segmentos para manejar card-composition
  // Preserva los grupos de form ya calculados y agrupa card-composition
  function regroupSegments(segs) {
    const result = [];
    for (const seg of segs) {
      if (seg.type === 'form') {
        // Separar card-composition de otros componentes del form
        const formComps = seg.items.filter(c => c.component !== 'card-composition');
        const cardComps = seg.items.filter(c => c.component === 'card-composition');
        if (formComps.length > 0) result.push({ type: 'form', items: formComps });
        if (cardComps.length > 0) result.push({ type: 'card-composition-group', items: cardComps });
      } else if (seg.type === 'single' && seg.comp.component === 'card-composition') {
        // Buscar si el último segmento también es card-composition-group
        const last = result[result.length - 1];
        if (last && last.type === 'card-composition-group') {
          last.items.push(seg.comp);
        } else {
          result.push({ type: 'card-composition-group', items: [seg.comp] });
        }
      } else {
        result.push(seg);
      }
    }
    return result;
  }

  function renderCardCompositionGroup(comps) {
    // Agrupar slots por card (una card = header + content + action opcionales)
    // Los slots están ordenados por order - agrupamos en bloques de max 3
    const cards = [];
    let current = [];
    for (const c of comps) {
      const slot = c.slot || c.props?.slot_variant || 'header';
      if (slot === 'header' && current.length > 0) {
        cards.push(current);
        current = [];
      }
      current.push(c);
    }
    if (current.length > 0) cards.push(current);

    // Si no hay agrupación clara, tratar cada comp como card individual
    if (cards.length === 0) cards.push(comps);

    return cards.map(cardSlots => {
      const p = cardSlots[0]?.props || {};
      // Determinar variante de la card
      const variant = p.slot_variant || 'card-media';
      const title   = escHtml(p.header_title || p.title || 'Artículo financiero');
      const text    = escHtml(p.content_text || p.text  || 'Resumen del contenido financiero más reciente.');
      const linkLabel = escHtml(p.link_label || 'Leer más →');

      if (variant === 'card-media' || variant.includes('media')) {
        return `<div class="ds-card-composition">
          <div class="ds-slot-header">
            <div class="ds-slot-header-left">
              <div class="ds-slot-title">${title}</div>
            </div>
            <span class="ds-slot-badge">Nuevo</span>
          </div>
          <div class="ds-slot-content">
            <div class="ds-slot-image-text">
              <div class="ds-slot-img">🖼️</div>
              <div class="ds-slot-text" style="flex:1">${text}</div>
            </div>
          </div>
          <div class="ds-slot-action">
            <span class="ds-slot-link">${linkLabel}</span>
          </div>
        </div>`;
      }
      // Fallback - card-action
      return `<div class="ds-card-composition">
        <div class="ds-slot-header">
          <div class="ds-slot-header-left">
            <div class="ds-slot-title">${title}</div>
          </div>
        </div>
        <div class="ds-slot-content">
          <div class="ds-slot-text">${text}</div>
        </div>
        <div class="ds-slot-action">
          <button class="ds-slot-btn-primary">${linkLabel}</button>
        </div>
      </div>`;
    }).join('\n');
  }

  // Reagrupar y renderizar segmentos
  const finalSegments = regroupSegments(segments);

  // Agrupar card-accounts consecutivos para grid 2 columnas
  const groupedSegments = [];
  for (let gi = 0; gi < finalSegments.length; gi++) {
    const seg = finalSegments[gi];
    if (seg.type === 'single' && seg.comp.component === 'card-accounts') {
      const group = [seg.comp];
      while (gi + 1 < finalSegments.length &&
             finalSegments[gi + 1].type === 'single' &&
             finalSegments[gi + 1].comp.component === 'card-accounts') {
        gi++;
        group.push(finalSegments[gi].comp);
      }
      groupedSegments.push({ type: 'card-accounts-group', items: group });
    } else {
      groupedSegments.push(seg);
    }
  }

  let bodyHtml = '';
  for (const seg of groupedSegments) {
    if (seg.type === 'form') {
      const innerHtml = seg.items.map(c => renderComponent(c, pattern)).join('\n');
      bodyHtml += `<div class="ds-form">${innerHtml}</div>`;
    } else if (seg.type === 'card-composition-group') {
      bodyHtml += renderCardCompositionGroup(seg.items);
    } else if (seg.type === 'card-accounts-group') {
      bodyHtml += renderCardAccounts(seg.items);
    } else {
      bodyHtml += renderComponent(seg.comp, pattern);
    }
  }

  if (modal) bodyHtml += renderModalBottomSheet(modal);

  const cssBlock  = withCSS ? `<style>${DS_CSS}</style>` : '';
  const outerOpen = target === 'preview' ? '' : `<div class="${wrapperClass}">`;
  const outerClose= target === 'preview' ? '' : '</div>';

  return `${cssBlock}${outerOpen}${bodyHtml}${outerClose}`;
}

// ─── DISPATCHER ──────────────────────────────────────────────────────────────

function renderComponent(comp, pattern) {
  if (!comp || !comp.component) return '';
  switch (comp.component) {
    case 'navigation-header':    return renderNavigationHeader(comp);
    case 'amount-display':       return renderAmountDisplay(comp);
    case 'chart-sparkline':      return renderChartSparkline(comp);
    case 'movements-set':        return renderMovementsSet(comp);
    case 'input-text':           return renderInputText(comp);
    case 'button-primary':       return renderButtonPrimary(comp);
    case 'button-secondary':     return renderButtonSecondary(comp);
    case 'card-item':
    case 'card-item/financial':
    case 'card-item/account':    return renderCardItem(comp, pattern);
    case 'filter-bar':           return renderFilterBar(comp);
    case 'list-header':          return renderListHeader(comp);
    case 'notification-banner':  return renderNotificationBanner(comp);
    case 'empty-state':          return renderEmptyState(comp);
    case 'tab-bar':              return renderTabBar(comp);
    case 'modal-bottom-sheet':   return ''; // se gestiona aparte
    case 'card-accounts':        return ''; // se gestiona en grupo
    default:                     return '';
  }
}

module.exports = { renderScreen, renderComponent, DS_CSS };
