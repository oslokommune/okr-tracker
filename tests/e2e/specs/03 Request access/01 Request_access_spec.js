import i18n from '../../../../src/locale/i18n';

describe('Request access', () => {
  before(() => {
    cy.visit('/').wait(2000);

    cy.get('body').then($body => {
      if ($body.text().includes('Test Admin') || $body.text().includes(Cypress.env('VUE_APP_TESTUSER_USER'))) {
        cy.signOut();
      }
    });
  });

  it('Visits the app root url', () => {
    cy.url().should('include', '/login');
  });

  it('Request access for two users', () => {
    cy.get('[data-cy="login-request"]').click();
    cy.get('[data-cy="request-input"]').type('rejectme@internet.com');
    cy.get('[data-cy="request-btn"]').click();
    cy.get('.toasted').should('contain', i18n.t('toaster.request.requested'));

    cy.url().should('include', '/login');

    cy.get('[data-cy="login-request"]').click();
    cy.get('[data-cy="request-input"]').type('acceptme@internet.com');
    cy.get('[data-cy="request-btn"]').click();
    cy.get('.toasted').should('contain', i18n.t('toaster.request.requested'));
    cy.url().should('include', '/login');
  });

  it('login as admin and accept one user and reject the other', () => {
    cy.signInAdminUser();

    cy.url().should('include', '/');

    cy.wait(200);

    cy.get('[data-cy="usermenu"]').click();
    cy.get('[data-cy="site-header-admin"]').click();

    cy.url().should('include', '/admin');
    cy.get('.access-requests__item')
      .eq(0)
      .within(() => {
        cy.get('.access-requests__email').should('contain', 'acceptme@internet.com');
        cy.get('[data-cy="request-accept"]').click();
      });

    cy.get('.toasted').should('contain', i18n.t('toaster.request.accepted', { user: 'acceptme@internet.com' }));

    cy.get('.access-requests__item')
      .eq(0)
      .within(() => {
        cy.get('.access-requests__email').should('contain', 'rejectme@internet.com');
        cy.get('[data-cy="request-reject"]').click();
      });

    cy.get('.toasted').should('contain', i18n.t('toaster.request.rejected', { user: 'rejectme@internet.com' }));

  });
});
