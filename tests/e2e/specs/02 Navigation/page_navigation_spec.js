/* eslint-disable */
describe('Page navigation', () => {
  it('Navigates to help page', () => {
    cy.visit('/');

    cy.get('body').then($body => {
      if ($body.text().includes('Du er ikke logget inn')) {
        cy.signInAdminUser();
      }
    });

    cy.get('.fa-question-circle').click();
    cy.url().should('include', '/help');
    cy.wait(3000);
    cy.get('.md').contains('Rettigheter til å endre');
  });

  it('Navigates home via bread crumb', () => {
    cy.get('a')
      .contains('Hjem')
      .click();
    cy.wait(100);
    cy.url().should('eq', Cypress.config().baseUrl);
  });

  it('Navigates to admin page', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('.usernav__name').click();
    cy.wait(500);
    cy.get('.usernav__menu .menu-item')
      .contains('Admin')
      .click();
    cy.wait(1000);
    cy.url().should('include', '/admin');
    cy.contains('Admin');
    cy.contains('Finn bruker');
    cy.contains('Produkter og produktområder');
  });

  it('Opens and closes newsfeed', () => {
    cy.visit('/');
    cy.wait(1000);
    cy.get('.newsfeed').should('not.be.visible');
    cy.get('.newsfeed-toggle').click();
    cy.wait(500);
    cy.get('.newsfeed .title-3').should('be.visible');
    cy.get('.newsfeed .title-3 button').click();
    cy.wait(500);
    cy.get('.newsfeed').should('not.be.visible');
  });

  it('Navigates to edit profile', () => {
    cy.visit('/me');
    cy.wait(1500);
    cy.get('.page-header__name .title-1').contains('Test Admin');
    cy.contains('Har administratortilgang');
    cy.contains('Endre bilde');
    cy.contains('Lagre');
  });
});
