/* eslint-disable */
describe('Environment checks', () => {
  it('Runs in development environment', () => {
    expect(Cypress.env('NODE_ENV')).to.equal('development');
  });

  it('Has required environment variables', () => {
    expect(Cypress.env('VITE_TESTADMIN_USER')).to.exist;
    expect(Cypress.env('VITE_TESTADMIN_PASSWORD')).to.exist;
    expect(Cypress.env('VITE_TESTUSER_USER')).to.exist;
    expect(Cypress.env('VITE_TESTUSER_PASSWORD')).to.exist;
    expect(Cypress.env('VITE_I18N_LOCALE')).to.exist;
    expect(Cypress.env('VITE_I18N_FALLBACK_LOCALE')).to.exist;
  });
});
