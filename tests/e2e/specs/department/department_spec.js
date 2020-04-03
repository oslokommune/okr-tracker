import uniqid from 'uniqid';

describe('Create department', () => {
  it('Visits the app root url', () => {
    const deps = uniqid();
    cy.visit('/');

    cy.wait(3000);

    cy.get('body').then($body => {
      if (!$body.text().includes('Hjem')) {
        cy.signInAdminUser();
      }
    });

    cy.visit('/admin');

    cy.wait(3000);

    cy.get('[id="admin-depsAndProds"]').click();

    cy.url().should('include', '/admin/data');

    cy.get('[id="admin-addDepartment"]').click();

    cy.get('[id="dep-name"]')
      .clear()
      .type(deps);

    cy.get('[id="btn-saveDep"]').click();

    cy.wait(500);

    cy.visit(`/department/${deps.toLowerCase()}`);

    cy.get('h1').should('contain', deps);
  });
});
