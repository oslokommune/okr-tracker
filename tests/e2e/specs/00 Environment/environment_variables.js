/* eslint-disable */
describe('Environment checks', () => {
  it('Runs in development environment', () => {
    expect(Cypress.env('NODE_ENV')).to.equal('development');
  });

  it('Has required environment variables', () => {
    expect(Cypress.env('VUE_APP_TESTADMIN_USER')).to.exist;
    expect(Cypress.env('VUE_APP_TESTADMIN_PASSWORD')).to.exist;
    expect(Cypress.env('VUE_APP_TESTUSER_USER')).to.exist;
    expect(Cypress.env('VUE_APP_TESTUSER_PASSWORD')).to.exist;
    expect(Cypress.env('VUE_APP_I18N_LOCALE')).to.exist;
    expect(Cypress.env('VUE_APP_I18N_FALLBACK_LOCALE')).to.exist;
  });
});
