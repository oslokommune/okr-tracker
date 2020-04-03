/* eslint-disable */
describe('Create a department', () => {
  it('Logs in as admin', () => {
    cy.visit('/');

    cy.wait(1000);

    cy.get('body').then($body => {
      if ($body.text().includes('Du er ikke logget inn')) {
        // cy.signedInAdminUser();
      } else {
        cy.log('test');
      }
    });

    cy.wait(1000);
    cy.signedInAdminUser();
  });
});
