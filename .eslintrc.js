module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/strongly-recommended', '@vue/airbnb', '@vue/prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 'off',
    'consistent-return': 'off',
    'no-use-before-define': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'func-names': 'off',
    'no-restricted-globals': 'off',
    'import/no-cycle': [2, { maxDepth: 1 }],
    'global-require': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
