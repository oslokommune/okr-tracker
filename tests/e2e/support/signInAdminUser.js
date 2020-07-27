Cypress.Commands.add('signInAdminUser', () => {
  cy.get('input[type="password"]').type(Cypress.env('VUE_APP_TESTADMIN_PASSWORD'));
  cy.get('form').submit();
  cy.wait(1000);
  cy.get('.usernav__display-name').contains('Test Admin');
});
