/**
 * Simple DS — Design Tokens
 * Generated from Figma variables
 * ES Module — import individual collections or the full `tokens` object
 *
 * Usage:
 *   import { colors, spacing, semantic } from './tokens.js'
 *   import tokens from './tokens.js'
 */

// ─── COLOR PRIMITIVES ────────────────────────────────────────────────────────

export const primitiveColors = {
  blue: {
    50:  '#EEF2FF',
    100: '#E0E7FF',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
  },
  neutral: {
    0:   '#FFFFFF',
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    700: '#334155',
    900: '#0F172A',
  },
  green: {
    100: '#DCFCE7',
    600: '#16A34A',
  },
  red: {
    100: '#FEE2E2',
    600: '#DC2626',
  },
  amber: {
    100: '#FEF9C3',
    600: '#D97706',
  },
  sky: {
    100: '#DBEAFE',
    600: '#2563EB',
  },
};

// ─── SPACING PRIMITIVES ──────────────────────────────────────────────────────

export const primitiveSpacing = {
  space: {
    0:  0,
    1:  2,
    2:  4,
    3:  6,
    4:  8,
    5:  10,
    6:  12,
    7:  16,
    8:  20,
    9:  24,
    10: 32,
    11: 40,
    12: 48,
  },
  radius: {
    none: 0,
    sm:   4,
    md:   8,
    lg:   12,
    xl:   16,
    full: 9999,
  },
};

// ─── SEMANTIC COLORS ─────────────────────────────────────────────────────────

export const colors = {
  surface: {
    primary:   primitiveColors.neutral[0],
    secondary: primitiveColors.neutral[50],
    tertiary:  primitiveColors.neutral[100],
  },
  text: {
    primary:   primitiveColors.neutral[900],
    secondary: primitiveColors.neutral[500],
    tertiary:  primitiveColors.neutral[400],
    inverse:   primitiveColors.neutral[0],
    brand:     primitiveColors.blue[600],
  },
  brand: {
    primary:   primitiveColors.blue[600],
    secondary: primitiveColors.blue[500],
    subtle:    primitiveColors.blue[50],
    hover:     primitiveColors.blue[700],
  },
  border: {
    default: primitiveColors.neutral[200],
    subtle:  primitiveColors.neutral[100],
    strong:  primitiveColors.neutral[300],
    brand:   primitiveColors.blue[600],
  },
  feedback: {
    success: {
      bg:   primitiveColors.green[100],
      text: primitiveColors.green[600],
    },
    error: {
      bg:   primitiveColors.red[100],
      text: primitiveColors.red[600],
    },
    warning: {
      bg:   primitiveColors.amber[100],
      text: primitiveColors.amber[600],
    },
    info: {
      bg:   primitiveColors.sky[100],
      text: primitiveColors.sky[600],
    },
  },
};

// ─── SEMANTIC SPACING ────────────────────────────────────────────────────────

export const spacing = {
  padding: {
    component: {
      xs: primitiveSpacing.space[2],   // 4px
      sm: primitiveSpacing.space[3],   // 6px
      md: primitiveSpacing.space[7],   // 16px
      lg: primitiveSpacing.space[9],   // 24px
    },
    vertical: {
      xs: primitiveSpacing.space[1],   // 2px
      sm: primitiveSpacing.space[3],   // 6px
      md: primitiveSpacing.space[4],   // 8px
      lg: primitiveSpacing.space[6],   // 12px
    },
  },
  gap: {
    xs: primitiveSpacing.space[1],     // 2px
    sm: primitiveSpacing.space[2],     // 4px
    md: primitiveSpacing.space[4],     // 8px
    lg: primitiveSpacing.space[6],     // 12px
    xl: primitiveSpacing.space[7],     // 16px
  },
  radius: {
    none: primitiveSpacing.radius.none, // 0px
    sm:   primitiveSpacing.radius.sm,   // 4px
    md:   primitiveSpacing.radius.md,   // 8px
    lg:   primitiveSpacing.radius.lg,   // 12px
    xl:   primitiveSpacing.radius.xl,   // 16px
    full: primitiveSpacing.radius.full, // 9999px
  },
};

// ─── COMPONENT TOKEN MAP ─────────────────────────────────────────────────────
// Tokens usados por cada componente — útil para validación en engine

export const componentTokens = {
  'navigation-header': {
    background:   'color/surface/primary',
    border:       'color/border/subtle',
    paddingH:     'padding/component/md',
  },
  'button-primary': {
    background:   'color/brand/primary',
    textColor:    'color/text/inverse',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/md',
    borderRadius: 'radius/component/md',
  },
  'button-secondary': {
    background:   'color/surface/primary',
    border:       'color/brand/primary',
    textColor:    'color/text/brand',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/md',
    borderRadius: 'radius/component/md',
  },
  'card-item': {
    background:   'color/surface/primary',
    border:       'color/border/subtle',
    titleColor:   'color/text/primary',
    subtitleColor:'color/text/secondary',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/lg',
    gap:          'gap/xl',
  },
  'input-text': {
    background:   'color/surface/primary',
    border:       'color/border/default',
    textColor:    'color/text/secondary',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/md',
    borderRadius: 'radius/component/sm',
  },
  'filter-bar': {
    background:   'color/surface/primary',
    chipActive:   'color/brand/subtle',
    gap:          'gap/md',
    borderRadius: 'radius/component/full',
  },
  'empty-state': {
    background:   'color/surface/primary',
    titleColor:   'color/text/primary',
    subtitleColor:'color/text/secondary',
    padding:      'padding/component/lg',
    gap:          'gap/xl',
  },
  'modal-bottom-sheet': {
    background:   'color/surface/primary',
    border:       'color/border/subtle',
    paddingH:     'padding/component/md',
    paddingV:     'padding/component/lg',
    gap:          'gap/lg',
    borderRadius: 'radius/component/xl',
  },
  'tab-bar': {
    background:    'color/surface/primary',
    border:        'color/border/subtle',
    activeColor:   'color/brand/primary',
    inactiveColor: 'color/text/tertiary',
    gap:           'gap/sm',
  },
  'list-header': {
    background:   'color/surface/secondary',
    titleColor:   'color/text/primary',
    actionColor:  'color/text/brand',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/md',
  },
  'badge': {
    background:   'color/feedback/success/bg',
    textColor:    'color/feedback/success/text',
    paddingH:     'padding/component/xs',
    paddingV:     'padding/vertical/xs',
    borderRadius: 'radius/component/full',
  },
  'notification-banner': {
    background:   'color/feedback/info/bg',
    border:       'color/border/subtle',
    titleColor:   'color/text/primary',
    subtitleColor:'color/text/secondary',
    dotColor:     'color/feedback/info/text',
    paddingH:     'padding/component/md',
    paddingV:     'padding/vertical/lg',
    gap:          'gap/lg',
    borderRadius: 'radius/component/lg',
  },
};

// ─── DEFAULT EXPORT ───────────────────────────────────────────────────────────

const tokens = {
  primitive: { colors: primitiveColors, spacing: primitiveSpacing },
  semantic:  { colors, spacing },
  components: componentTokens,
};

export default tokens;
