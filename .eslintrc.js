module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/recommended', 'airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-param-reassign': 'off',
    'vue/no-v-html': 'off',
    'no-use-before-define': 'off',
    'func-names': 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
