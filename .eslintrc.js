module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: ['plugin:vue/recommended', 'airbnb-base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 'off',
    'vue/no-v-html': 'off',
    'no-use-before-define': 'off',
    'func-names': 'off',
    'no-restricted-syntax': 'off',
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
