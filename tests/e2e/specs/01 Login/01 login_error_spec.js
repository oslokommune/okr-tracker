import i18n from '../../../../src/locale/i18n';

describe('Login error', () => {
  beforeEach(() => {
    cy.visit('/').wait(500);

    cy.get('body').then($body => {
      if ($body.text().includes('Test Admin') || $body.text().includes(Cypress.env('VUE_APP_TESTUSER_USER'))) {
        cy.signOut();
      }
    });
  });

  it('Visits the app root url', () => {
    cy.url().should('include', '/login');
  });

  it('Try to login with a wrong username - get an userNotFound error', () => {
    cy.get('[data-cy="login-username"]').click();
    cy.get('[data-cy="login-username-input"]').type('wrong-mail@internet.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('form').submit();
    cy.get('.error').contains(i18n.t('login.error.userNotFound'));
  });

  it('Try to login with a correct username but wrong pass - get an wrongPass error', () => {
    cy.get('[data-cy="login-username"]').click();
    cy.get('[data-cy="login-username-input"]').type(Cypress.env('VUE_APP_TESTADMIN_USER'));
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('form').submit();
    cy.get('.error').contains(i18n.t('login.error.wrongPassword'));
  });
});
