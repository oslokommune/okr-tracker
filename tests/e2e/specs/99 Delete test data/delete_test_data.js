describe('Delete department', () => {
  it('Deletes test department', () => {
    cy.deleteTestDepartment();
  });

  it('Removes test user', () => {
    cy.visit('/admin').wait(2000);

    cy.get('.whitelist__body')
      .find('.whitelist__row')
      .filter(`:contains(${Cypress.env('VUE_APP_TESTUSER_USER')})`)
      .find('.btn--borderless')
      .click();
  });
});
