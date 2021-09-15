/* eslint-disable arrow-body-style */
// https://docs.cypress.io/guides/guides/plugins-guide.html

// if you need a custom webpack configuration you can uncomment the following import
// and then use the `file:preprocessor` event
// as explained in the cypress docs
// https://docs.cypress.io/api/plugins/preprocessors-api.html#Examples

// /* eslint-disable import/no-extraneous-dependencies, global-require */
// const webpack = require('@cypress/webpack-preprocessor')

// Which environment variables should be copied to cypress
const variables = [
  'VITE_DASHBOARD_USER',
  'VITE_TESTADMIN_USER',
  'VITE_TESTADMIN_PASSWORD',
  'VITE_TESTUSER_USER',
  'VITE_TESTUSER_PASSWORD',
  'VITE_I18N_LOCALE',
  'VITE_I18N_FALLBACK_LOCALE',
  'NODE_ENV',
];

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  // Copy environment variables
  config.env = config.env || {};
  variables.forEach((variable) => {
    config.env[variable] = import.meta.env[variable];
  });

  return {
    ...config,
    fixturesFolder: 'tests/e2e/fixtures',
    integrationFolder: 'tests/e2e/specs',
    screenshotsFolder: 'tests/e2e/screenshots',
    videosFolder: 'tests/e2e/videos',
    supportFile: 'tests/e2e/support/index.js',
  };
};
