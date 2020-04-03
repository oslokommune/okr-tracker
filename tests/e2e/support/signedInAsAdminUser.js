Cypress.Commands.add('signedInAdminUser', () => {
  cy.visit('/');
  cy.wait(500);
  cy.get('.usernav__display-name').contains('Test Admin');
});
