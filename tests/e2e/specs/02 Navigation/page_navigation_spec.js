/* eslint-disable */
describe('Page navigation', () => {
  before(() => {
    cy.visit('/');

  })

  it('Navigates to help page', () => {
    cy.get('.fa-question-circle').click();
    cy.url().should('include', '/help');
    cy.get('.md').contains('Rettigheter til å endre');
  });

  it('Navigates home via bread crumb', () => {
    cy.get('a')
      .contains('Hjem')
      .click();
    cy.url().should('eq', Cypress.config().baseUrl);
  });

  it('Navigates to admin page', () => {
    cy.get('[data-cy="usermenu"').click();
    cy.get('[data-cy="site-header-admin"]').click();
    cy.url().should('include', '/admin');
    cy.contains('Admin');
    cy.contains('Organisasjoner');
    cy.contains('Brukere');
  });

  it('Navigates to edit profile', () => {
    cy.visit('/user');
    cy.get('.title-1').contains('Test Admin');
    cy.contains('Har administratortilgang');
    cy.contains('Lagre');
  });
});
