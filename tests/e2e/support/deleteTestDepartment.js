import { testDepartment } from '../config';

Cypress.Commands.add('deleteTestDepartment', () => {
  cy.visit('/admin/data').wait(2000);

  cy.get('.miller__col__item')
    .contains(testDepartment.name)
    .click()
    .wait(600);

  cy.get('#btn-deleteDep')
    .click()
    .wait(600);

  cy.get('.toggle')
    .click()
    .wait(1000);

  cy.get('.miller__col__item')
    .contains(testDepartment.name)
    .click()
    .wait(1000);

  cy.get('[data-cy="permanently-delete-object"]')
    .click()
    .wait(1000);
});
