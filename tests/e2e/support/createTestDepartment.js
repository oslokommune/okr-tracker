import { testDepartment } from '../config';

Cypress.Commands.add('createTestDepartment', () => {
  cy.visit('/admin').wait(3000);

  cy.get('[id="admin-depsAndProds"]')
    .click()
    .wait(100);

  cy.url().should('include', '/admin/data');

  cy.get('[id="admin-addDepartment"]')
    .click()
    .wait(100);

  cy.get('[id="dep-name"]')
    .clear()
    .type(testDepartment.name);

  cy.get('#dep-missionStatement')
    .clear()
    .type(testDepartment.mission_statement);

  cy.get('[id="btn-saveDep"]')
    .click()
    .wait(100);
});
