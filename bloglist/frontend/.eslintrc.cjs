// .eslintrc.cjs

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier', // Desactiva las reglas de abajo si chocan
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.js'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['react-refresh'],
  rules: {
    // REGLAS DE LÓGICA
    eqeqeq: 'error',
    'no-console': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'no-unused-vars': 'warn', // Cambiado a warn para que avise sin bloquear

    // REGLAS DE FORMATO
    // Borrado 'indent', 'quotes', 'semi', 'no-trailing-spaces', etc.
    // porque 'prettier' ya las maneja a través de tu archivo .prettierrc

    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
