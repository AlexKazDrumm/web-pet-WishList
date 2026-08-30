import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'e2e/**',
      'next.config.js',
    ],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      '@next/next/no-img-element': 'off',
      // Data is loaded from an effect on mount / on auth change; the one extra
      // render this costs is intentional and not a correctness issue.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default config;
