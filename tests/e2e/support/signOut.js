Cypress.Commands.add('signOut', () => {
  cy.get('[data-cy="usermenu"]').click();
  cy.get('[data-cy="site-header-signout"]').click();
});
