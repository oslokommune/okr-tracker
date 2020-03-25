Cypress.Commands.add('signOut', () => {
  cy.wait(1000);
  cy.get('.usernav__name').click();
  cy.wait(100);
  cy.get('span')
    .contains('Logg ut')
    .click();
  cy.wait(1000);
});
