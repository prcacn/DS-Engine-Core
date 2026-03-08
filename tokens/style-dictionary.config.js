/**
 * Simple DS — Style Dictionary config
 * Transforma tokens.json en CSS, SCSS, JS y iOS/Android
 *
 * Install:  npm install style-dictionary
 * Run:      npx style-dictionary build --config style-dictionary.config.js
 */

module.exports = {
  source: ['tokens.json'],
  platforms: {

    // ── CSS Custom Properties ─────────────────────────────────────────────
    css: {
      transformGroup: 'css',
      prefix: 'ds',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: {
            outputReferences: true,   // Genera var(--ds-primitive-...) en semánticos
            selector: ':root',
          },
        },
      ],
    },

    // ── SCSS Variables ────────────────────────────────────────────────────
    scss: {
      transformGroup: 'scss',
      prefix: 'ds',
      buildPath: 'dist/scss/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
          options: { outputReferences: true },
        },
      ],
    },

    // ── JavaScript ES Module ──────────────────────────────────────────────
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [
        {
          destination: 'tokens.mjs',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.cjs',
          format: 'javascript/module',
        },
      ],
    },

    // ── TypeScript declarations ───────────────────────────────────────────
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/types/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },

    // ── iOS (Swift) ───────────────────────────────────────────────────────
    ios: {
      transformGroup: 'ios-swift',
      buildPath: 'dist/ios/',
      files: [
        {
          destination: 'SimpleDS+Tokens.swift',
          format: 'ios-swift/class.swift',
          className: 'SimpleDSTokens',
        },
      ],
    },

    // ── Android (XML) ─────────────────────────────────────────────────────
    android: {
      transformGroup: 'android',
      buildPath: 'dist/android/',
      files: [
        {
          destination: 'tokens_colors.xml',
          format: 'android/colors',
          filter: { attributes: { category: 'color' } },
        },
        {
          destination: 'tokens_dimens.xml',
          format: 'android/dimens',
          filter: { attributes: { category: 'spacing' } },
        },
      ],
    },

  },
};
