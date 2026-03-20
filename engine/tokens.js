// tokens.js — Design Tokens del DS Simple
// Generado automáticamente desde Figma · Variables sincronizadas
// Archivo: Simple DS · Última sincronización: 2026-03-21

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function rgba(r, g, b, a = 1) {
  const toHex = n => Math.round(n * 255).toString(16).padStart(2, '0');
  if (a === 1) return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  return `rgba(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(b*255)}, ${Math.round(a*100)/100})`;
}

// ─── PRIMITIVES — COLOR ───────────────────────────────────────────────────────

export const primitiveColors = {
  blue: {
    100:  rgba(0.933, 0.949, 1),       // #EEF2FF
    200:  rgba(0.878, 0.906, 1),       // #E0E8FF
    300:  rgba(0.780, 0.824, 0.996),   // #C7D3FE
    400:  rgba(0.647, 0.706, 0.988),   // #A5B4FB
    500:  rgba(0.506, 0.549, 0.973),   // #818CF8
    600:  rgba(0.388, 0.400, 0.945),   // #6366F1
    700:  rgba(0.310, 0.275, 0.898),   // #4F46E5
    800:  rgba(0.263, 0.220, 0.792),   // #4338CA
    900:  rgba(0.216, 0.188, 0.639),   // #3730A3
    1000: rgba(0.192, 0.180, 0.506),   // #312E81
  },
  neutral: {
    100:  rgba(1, 1, 1),               // #FFFFFF
    200:  rgba(0.973, 0.980, 0.988),   // #F8FAFB
    300:  rgba(0.945, 0.961, 0.976),   // #F1F5F9
    400:  rgba(0.886, 0.910, 0.941),   // #E2E8F0
    500:  rgba(0.796, 0.835, 0.882),   // #CBD5E1
    600:  rgba(0.580, 0.639, 0.722),   // #94A3B8
    700:  rgba(0.392, 0.455, 0.545),   // #64748B
    800:  rgba(0.278, 0.333, 0.412),   // #475569
    900:  rgba(0.200, 0.255, 0.333),   // #334155
    1000: rgba(0.059, 0.090, 0.165),   // #0F172A
  },
  green: {
    100:  rgba(0.941, 0.992, 0.957),   // #F0FDF4
    200:  rgba(0.863, 0.988, 0.906),   // #DCFCE7
    300:  rgba(0.733, 0.969, 0.816),   // #BBF7D0
    400:  rgba(0.525, 0.937, 0.675),   // #86EFAC
    500:  rgba(0.290, 0.871, 0.502),   // #4ADE80
    600:  rgba(0.133, 0.773, 0.369),   // #22C55E
    700:  rgba(0.086, 0.639, 0.290),   // #16A34A
    800:  rgba(0.082, 0.502, 0.239),   // #15803D
    900:  rgba(0.086, 0.396, 0.204),   // #166534
    1000: rgba(0.078, 0.325, 0.176),   // #14532D
  },
  red: {
    100:  rgba(0.996, 0.949, 0.949),   // #FEF2F2
    200:  rgba(0.996, 0.886, 0.886),   // #FEE2E2
    300:  rgba(0.996, 0.792, 0.792),   // #FECACA
    400:  rgba(0.988, 0.647, 0.647),   // #FCA5A5
    500:  rgba(0.973, 0.443, 0.443),   // #F87171
    600:  rgba(0.937, 0.267, 0.267),   // #EF4444
    700:  rgba(0.863, 0.149, 0.149),   // #DC2626
    800:  rgba(0.725, 0.110, 0.110),   // #B91C1C
    900:  rgba(0.600, 0.106, 0.106),   // #991B1B
    1000: rgba(0.498, 0.114, 0.114),   // #7F1D1D
  },
  amber: {
    100:  rgba(1, 0.984, 0.922),       // #FFFBEB
    200:  rgba(0.996, 0.953, 0.780),   // #FEF3C7
    300:  rgba(0.992, 0.902, 0.541),   // #FDE68A
    400:  rgba(0.988, 0.827, 0.302),   // #FCD34D
    500:  rgba(0.984, 0.749, 0.141),   // #FBBF24
    600:  rgba(0.961, 0.620, 0.043),   // #F59E0B
    700:  rgba(0.851, 0.467, 0.024),   // #D97706
    800:  rgba(0.706, 0.325, 0.035),   // #B45309
    900:  rgba(0.573, 0.251, 0.055),   // #92400E
    1000: rgba(0.471, 0.208, 0.059),   // #78350F
  },
  sky: {
    100:  rgba(0.941, 0.976, 1),       // #F0F9FF
    200:  rgba(0.878, 0.949, 0.996),   // #E0F2FE
    300:  rgba(0.729, 0.902, 0.992),   // #BAE6FD
    400:  rgba(0.490, 0.827, 0.988),   // #7DD3FC
    500:  rgba(0.220, 0.741, 0.973),   // #38BDF8
    600:  rgba(0.055, 0.647, 0.914),   // #0EA5E9
    700:  rgba(0.008, 0.518, 0.780),   // #0284C7
    800:  rgba(0.012, 0.412, 0.631),   // #0369A1
    900:  rgba(0.027, 0.349, 0.522),   // #075985
    1000: rgba(0.047, 0.290, 0.431),   // #0C4A6E
  },
};

// ─── PRIMITIVES — TYPOGRAPHY ──────────────────────────────────────────────────

export const primitiveTypography = {
  fontFamily: { base: 'DM Sans' },
  fontSize: {
    10: 10, 12: 12, 14: 14, 16: 16,
    20: 20, 24: 24, 30: 30, 36: 36,
  },
  fontWeight: {
    regular:  400,
    medium:   500,
    semiBold: 600,
    bold:     700,
  },
  lineHeight: {
    tight:   1.20,
    normal:  1.40,
    relaxed: 1.60,
  },
  letterSpacing: {
    tight:  -0.3,
    normal:  0,
    wide:    0.3,
  },
};

// ─── PRIMITIVES — SIZE & RADIUS ───────────────────────────────────────────────

export const primitiveSize = {
  0: 0, 2: 2, 4: 4, 8: 8,
  12: 12, 16: 16, 24: 24, 32: 32, 48: 48,
};

export const primitiveRadius = {
  none: 0,
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  full: 999,
};

// ─── SEMANTIC — COLORS (Brand A · Light / Dark) ───────────────────────────────

export const colors = {
  // Background
  background: {
    default:         { light: primitiveColors.neutral[100], dark: primitiveColors.neutral[1000] },
    defaultHover:    { light: primitiveColors.neutral[300], dark: primitiveColors.neutral[900] },
    secondary:       { light: primitiveColors.neutral[300], dark: primitiveColors.neutral[900] },
    secondaryHover:  { light: primitiveColors.neutral[400], dark: primitiveColors.neutral[700] },
    tertiary:        { light: primitiveColors.neutral[500], dark: primitiveColors.neutral[600] },
    tertiaryHover:   { light: primitiveColors.neutral[600], dark: primitiveColors.neutral[700] },
    neutralDefault:  { light: primitiveColors.neutral[300], dark: primitiveColors.neutral[700] },
    neutralHover:    { light: primitiveColors.neutral[400], dark: primitiveColors.neutral[600] },
    neutralSecondary:{ light: primitiveColors.neutral[200], dark: primitiveColors.neutral[900] },
    brandDefault:    { light: primitiveColors.blue[700],    dark: primitiveColors.blue[200] },
    brandHover:      { light: primitiveColors.blue[800],    dark: primitiveColors.blue[300] },
    brandSecondary:  { light: primitiveColors.blue[200],    dark: primitiveColors.blue[800] },
    brandSubtle:     { light: primitiveColors.blue[100],    dark: primitiveColors.blue[1000] },
    positiveDefault: { light: primitiveColors.green[700],   dark: primitiveColors.green[200] },
    positiveSubtle:  { light: primitiveColors.green[100],   dark: primitiveColors.green[800] },
    warningDefault:  { light: primitiveColors.amber[700],   dark: primitiveColors.amber[200] },
    warningSubtle:   { light: primitiveColors.amber[100],   dark: primitiveColors.amber[800] },
    dangerDefault:   { light: primitiveColors.red[700],     dark: primitiveColors.red[200] },
    dangerSubtle:    { light: primitiveColors.red[100],     dark: primitiveColors.red[800] },
    infoDefault:     { light: primitiveColors.sky[700],     dark: primitiveColors.sky[200] },
    infoSubtle:      { light: primitiveColors.sky[100],     dark: primitiveColors.sky[800] },
  },
  // Text
  text: {
    default:          { light: primitiveColors.neutral[1000], dark: primitiveColors.neutral[100] },
    secondary:        { light: primitiveColors.neutral[800],  dark: primitiveColors.neutral[300] },
    tertiary:         { light: primitiveColors.neutral[600],  dark: primitiveColors.neutral[500] },
    nochange:         { light: primitiveColors.neutral[100],  dark: primitiveColors.neutral[1000] },
    neutralDefault:   { light: primitiveColors.neutral[700],  dark: primitiveColors.neutral[400] },
    neutralSecondary: { light: primitiveColors.neutral[600],  dark: primitiveColors.neutral[500] },
    neutralTertiary:  { light: primitiveColors.neutral[500],  dark: primitiveColors.neutral[600] },
    brandDefault:     { light: primitiveColors.blue[700],     dark: primitiveColors.blue[300] },
    brandSecondary:   { light: primitiveColors.blue[600],     dark: primitiveColors.blue[400] },
    brandSubtle:      { light: primitiveColors.blue[500],     dark: primitiveColors.blue[500] },
    positiveDefault:  { light: primitiveColors.green[700],    dark: '#FFFFFF' },
    positiveSecondary:{ light: primitiveColors.green[800],    dark: primitiveColors.green[200] },
    warningDefault:   { light: primitiveColors.amber[700],    dark: primitiveColors.amber[300] },
    warningSecondary: { light: primitiveColors.amber[800],    dark: primitiveColors.amber[200] },
    dangerDefault:    { light: primitiveColors.red[700],      dark: primitiveColors.red[300] },
    dangerSecondary:  { light: primitiveColors.red[800],      dark: primitiveColors.red[200] },
    infoDefault:      { light: primitiveColors.sky[700],      dark: primitiveColors.sky[200] },
    infoSecondary:    { light: primitiveColors.sky[800],      dark: primitiveColors.sky[200] },
  },
  // Border
  border: {
    default:         { light: primitiveColors.neutral[400], dark: primitiveColors.neutral[600] },
    strong:          { light: primitiveColors.neutral[600], dark: primitiveColors.neutral[500] },
    subtle:          { light: primitiveColors.neutral[300], dark: primitiveColors.neutral[700] },
    brandDefault:    { light: primitiveColors.blue[700],    dark: primitiveColors.blue[400] },
    brandSubtle:     { light: primitiveColors.blue[300],    dark: primitiveColors.blue[700] },
    positiveDefault: { light: primitiveColors.green[700],   dark: primitiveColors.green[400] },
    warningDefault:  { light: primitiveColors.amber[700],   dark: primitiveColors.amber[400] },
    dangerDefault:   { light: primitiveColors.red[700],     dark: primitiveColors.red[400] },
  },
  // Icon
  icon: {
    default:         { light: primitiveColors.neutral[1000], dark: primitiveColors.neutral[100] },
    secondary:       { light: primitiveColors.neutral[700],  dark: primitiveColors.neutral[400] },
    tertiary:        { light: primitiveColors.neutral[500],  dark: primitiveColors.neutral[600] },
    brandDefault:    { light: primitiveColors.blue[700],     dark: primitiveColors.blue[300] },
    positiveDefault: { light: primitiveColors.green[700],    dark: primitiveColors.green[300] },
    warningDefault:  { light: primitiveColors.amber[700],    dark: primitiveColors.amber[300] },
    dangerDefault:   { light: primitiveColors.red[700],      dark: primitiveColors.red[300] },
  },
};

// ─── SEMANTIC — TYPOGRAPHY ────────────────────────────────────────────────────

export const typography = {
  display: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[24],
    fontWeight: primitiveTypography.fontWeight.bold,
    lineHeight: primitiveTypography.lineHeight.tight,
  },
  heading: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[16],
    fontWeight: primitiveTypography.fontWeight.semiBold,
    lineHeight: primitiveTypography.lineHeight.normal,
  },
  bodyStrong: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[14],
    fontWeight: primitiveTypography.fontWeight.medium,
    lineHeight: primitiveTypography.lineHeight.normal,
  },
  body: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[14],
    fontWeight: primitiveTypography.fontWeight.regular,
    lineHeight: primitiveTypography.lineHeight.relaxed,
  },
  label: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[12],
    fontWeight: primitiveTypography.fontWeight.regular,
    lineHeight: primitiveTypography.lineHeight.tight,
  },
  captionStrong: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[12],
    fontWeight: primitiveTypography.fontWeight.regular,
    lineHeight: primitiveTypography.lineHeight.normal,
  },
  caption: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[12],
    fontWeight: primitiveTypography.fontWeight.regular,
    lineHeight: primitiveTypography.lineHeight.normal,
  },
  micro: {
    fontFamily: primitiveTypography.fontFamily.base,
    fontSize:   primitiveTypography.fontSize[10],
    fontWeight: primitiveTypography.fontWeight.regular,
    lineHeight: primitiveTypography.lineHeight.tight,
  },
};

// ─── SEMANTIC — SPACING ───────────────────────────────────────────────────────

export const spacing = {
  padding: {
    horizontal: {
      sm: primitiveSize[8],
      md: primitiveSize[16],
      lg: primitiveSize[24],
    },
    vertical: {
      xs: primitiveSize[2],
      sm: primitiveSize[8],
      md: primitiveSize[12],
      lg: primitiveSize[24],
    },
  },
  gap: {
    xs: primitiveSize[2],
    sm: primitiveSize[4],
    md: primitiveSize[8],
    lg: primitiveSize[12],
    xl: primitiveSize[16],
  },
  radius: {
    none: primitiveRadius.none,
    xs:   primitiveRadius.xs,
    sm:   primitiveRadius.sm,
    md:   primitiveRadius.md,
    lg:   primitiveRadius.lg,
    full: primitiveRadius.full,
  },
};

// ─── GRID — MOBILE ────────────────────────────────────────────────────────────

export const grid = {
  mobile: {
    columns:    4,
    margin:     primitiveSize[16],   // → Size/16
    gutter:     primitiveSize[8],    // → Size/8
    rowBase:    primitiveSize[8],    // → Size/8
    columnWidth: 82,                 // (390 - 16*2 - 8*3) / 4
    screen: {
      width:  390,
      height: 844,
    },
    safeZone: {
      top:    primitiveSize[16],     // → Size/16
      bottom: 34,                    // iOS safe area
    },
  },
};

// ─── CSS CUSTOM PROPERTIES (helper) ──────────────────────────────────────────
// Usa esto para generar variables CSS en tu proyecto:
//
// :root {
//   --color-bg-default: ${colors.background.default.light};
//   --color-text-default: ${colors.text.default.light};
//   --font-size-body: ${typography.body.fontSize}px;
//   ...
// }

export default {
  primitiveColors,
  primitiveTypography,
  primitiveSize,
  primitiveRadius,
  colors,
  typography,
  spacing,
  grid,
};
