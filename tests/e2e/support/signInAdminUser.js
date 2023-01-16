Cypress.Commands.add('signInAdminUser', () => {
  cy.get('[data-cy="login-username"]').click();
  cy.get('[data-cy="login-username-input"]').type(Cypress.env('VITE_TESTADMIN_USER'));
  cy.get('input[type="password"]').type(Cypress.env('VITE_TESTADMIN_PASSWORD'));
  cy.get('form').submit();
  cy.wait(2000);
  cy.get('.user__name').contains('Test Admin');
});
