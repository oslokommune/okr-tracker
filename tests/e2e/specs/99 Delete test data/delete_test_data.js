describe('Delete department', () => {
  before(() => {
    cy.visit('/');
    cy.signInAdminUser();
  });

  it('Deletes test products', () => {
    cy.deleteProduct(0);
    cy.deleteProduct(1);
  });

  it('Deletes test department', () => {
    cy.deleteTestDepartment();
  });

  it('Removes test user', () => {
    cy.visit('/admin').wait(3000);

    cy.get('.whitelist__body')
      .find('.whitelist__row')
      .filter(`:contains(${Cypress.env('VUE_APP_TESTUSER_USER')})`)
      .find('.btn--borderless')
      .click()
      .wait(1000);
  });

  it('Logs out', () => {
    cy.signOut();
  });
});
