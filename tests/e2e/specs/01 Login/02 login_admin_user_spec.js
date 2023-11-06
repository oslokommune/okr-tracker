describe('Test Admin Login', () => {
  before(() => {
    cy.visit('/').wait(2000);

    cy.get('body').then(($body) => {
      if (
        $body.text().includes('Test Admin') ||
        $body.text().includes(Cypress.env('VITE_TESTUSER_USER'))
      ) {
        cy.signOut();
      }
    });
  });

  it('Visits the app root url', () => {
    cy.url().should('include', '/login');
  });

  it('Logs in as test admin', () => {
    cy.signInAdminUser();
  });
});
