Cypress.Commands.add('signInAdminUser', () => {
  cy.get('[data-cy="login-username"]').click();
  cy.get('[data-cy="login-username-input"]').type(Cypress.env('VUE_APP_TESTADMIN_USER'));
  cy.get('input[type="password"]').type(Cypress.env('VUE_APP_TESTADMIN_PASSWORD'));
  cy.get('form').submit();
  cy.get('.user__name').contains('Test Admin');
});
