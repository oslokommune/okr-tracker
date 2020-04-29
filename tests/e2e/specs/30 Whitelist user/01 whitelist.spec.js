describe('Whitelist user', () => {
  before(() => {
    cy.visit('/').wait(3000);

    // Log in as admin if not already logged in
    cy.get('body').then($body => {
      if (!$body.text().includes('Hjem')) {
        cy.log('Signing in as admin user');
        cy.signInAdminUser();
      } else {
        cy.log('Already logged in');
      }
    });
  });

  it('Creates a new whitelisted user', () => {
    cy.visit('/admin').wait(2000);

    cy.get('.whitelist__body').should('not.contain', Cypress.env('VUE_APP_TESTUSER_USER'));

    cy.get('[data-cy="email_list"]')
      .clear()
      .type(Cypress.env('VUE_APP_TESTUSER_USER'))
      .get('[data-cy="add_users_button"]')
      .click()
      .wait(100);

    cy.get('.whitelist__body').should('contain', Cypress.env('VUE_APP_TESTUSER_USER'));
  });

  it('Finds the test user with search', () => {
    cy.get('[data-cy="user_search_field"]')
      .clear()
      .type(Cypress.env('VUE_APP_TESTUSER_USER'))
      .wait(100);

    cy.get('.whitelist__body').should('contain', Cypress.env('VUE_APP_TESTUSER_USER'));
  });
});
