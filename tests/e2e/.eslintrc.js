module.exports = {
  plugins: ['cypress'],
  env: {
    mocha: true,
    'cypress/globals': true,
  },

  extends: ['plugin:cypress/recommended'],
};
