module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    /*
    Provides Airbnb's base JS .eslintrc as an extensible shared config.
    https://github.com/airbnb/javascript
    */
    'airbnb-base',
    /*
    Use the recommended rule preset for `eslint-plugin-vue`.
    https://eslint.vuejs.org/rules/
    */
    'plugin:vue/recommended',
    /*
    Use as the last extension in order to override conflicting ESLint rules.
    https://github.com/prettier/eslint-plugin-prettier
    */
    'plugin:prettier/recommended',
  ],
  plugins: [
    /*
    Official ESLint plugin for Vue.js. Allows us to check the `<template>` and
    `<script>` of `.vue` files with ESLint, as well as Vue code in `.js` files.
    https://eslint.vuejs.org
    */
    'vue',
    /*
    Enable `eslint-plugin-prettier`, which sets the `prettier/prettier`
    rule to "error". Prevents code formatting conflicts between rules
    from ESLint and Prettier.
    https://github.com/prettier/eslint-plugin-prettier
    */
    'prettier',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 'off',
    'vue/no-v-html': 'off',
    'no-use-before-define': 'off',
    // TODO: Re-enable and lint this rule separately.
    'vue/multi-word-component-names': 'off',
    'func-names': 'off',
    'no-restricted-syntax': 'off',
    'import/extensions': [0, 'never'],
    'prefer-destructuring': 'off',
    'no-underscore-dangle': 'off',
    curly: ['error', 'all'],
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
      },
    },
  },
};
