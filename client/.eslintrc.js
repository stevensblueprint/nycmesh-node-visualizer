module.exports = {
  root: true,
  extends: [
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:tailwindcss/recommended',
    'react-app',
  ],
  rules: {},

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['react', 'prettier'],
  overrides: [],
};
