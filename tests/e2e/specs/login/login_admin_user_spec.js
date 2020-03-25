/* eslint-disable */
describe('Test Admin Login', () => {
  it('Visits the app root url', () => {
    cy.visit('/');

    cy.wait(3000);

    cy.get('body').then($body => {
      if ($body.text().includes('Hjem')) {
        cy.signOut();
      }
    });

    cy.url().should('include', '/login');
  });

  it('Logs in as test admin', () => {
    cy.signInAdminUser();
  });
});
