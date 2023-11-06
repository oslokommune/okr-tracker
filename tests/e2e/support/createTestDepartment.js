import { testDepartment } from '../config';

Cypress.Commands.add('createTestDepartment', () => {
  cy.visit('/admin');

  cy.get('[data-cy="create-department"]').click();

  cy.url().should('include', '/admin/create-department');

  cy.get('[data-cy="dep-name"]').clear().type(testDepartment.name);

  cy.get('[data-cy="dep-missionStatement"]')
    .clear()
    .type(testDepartment.mission_statement);

  cy.get('[data-cy="dep-parentOrg"]')
    .select(testDepartment.parentOrg)
    .should('have.value', testDepartment.parentOrg);

  cy.get('[data-cy="btn-createDep"]').click();
});
