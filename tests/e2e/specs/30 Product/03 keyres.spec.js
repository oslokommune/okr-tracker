describe('Create key results', () => {
  before(() => {
    cy.visit('/').wait(3000);

    // Log in as admin if not already logged in
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Hjem')) {
        cy.log('Signing in as admin user');
        cy.signInAdminUser();
      } else {
        cy.log('Already logged in');
      }
    });
  });

  it('Creates key result for test product one', () => {
    cy.createKeyres(0);
  });
  it('Creates key result for test product two', () => {
    cy.createKeyres(1);
  });
});
