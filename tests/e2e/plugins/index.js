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
  'VUE_APP_DASHBOARD_USER',
  'VUE_APP_TESTADMIN_USER',
  'VUE_APP_TESTADMIN_PASSWORD',
  'VUE_APP_TESTUSER_USER',
  'VUE_APP_TESTUSER_PASSWORD',
  'VUE_APP_I18N_LOCALE',
  'VUE_APP_I18N_FALLBACK_LOCALE',
  'NODE_ENV',
];

module.exports = (on, config) => {
  // on('file:preprocessor', webpack({
  //  webpackOptions: require('@vue/cli-service/webpack.config'),
  //  watchOptions: {}
  // }))

  // Copy environment variables
  config.env = config.env || {};
  variables.forEach(variable => {
    config.env[variable] = process.env[variable];
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
