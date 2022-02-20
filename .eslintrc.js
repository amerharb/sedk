module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  ignorePatterns: '*.js',
  overrides: [
    {
      files: ['**/*.ts'],
      rules: {
        'indent': ['error', 2],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['warn', 'single', { 'avoidEscape': true }],
        'semi': ['warn', 'never'],
        'object-curly-spacing': [
          'warn', 'always', { 'objectsInObjects': false, 'arraysInObjects': true },
        ],
        'no-empty-function': ['error', { 'allow': ['constructors'] }],
        'no-explicit-any': ['off'],
        'no-console': 'warn',
        'no-unused-private-class-members': ['off'],
      },
    },
  ],
}
