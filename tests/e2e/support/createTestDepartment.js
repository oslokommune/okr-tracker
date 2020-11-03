import { testDepartment } from '../config';

Cypress.Commands.add('createTestDepartment', () => {
  cy.visit('/admin').wait(3000);

  cy.get('[data-cy="admin-depsAndProds"]').click().wait(600);

  cy.url().should('include', '/admin/data');

  cy.get('[data-cy="admin-addDepartment"]').click().wait(600);

  cy.get('[data-cy="dep-name"]').clear().type(testDepartment.name);

  cy.get('[data-cy="dep-missionStatement"]').clear().type(testDepartment.mission_statement);

  cy.get('[data-cy="btn-saveDep"]').click();
});
