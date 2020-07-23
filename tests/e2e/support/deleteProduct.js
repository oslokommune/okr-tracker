import { testDepartment, testProducts } from '../config';

Cypress.Commands.add('deleteProduct', productIndex => {
  cy.visit('/admin').wait(2000);

  cy.get('[id="admin-depsAndProds"]').click().wait(1000);

  cy.url().should('include', '/admin/data');

  cy.get('.miller__col__item').contains(testDepartment.name).click().wait(500);

  cy.get('.miller__col__item').contains(testProducts[productIndex].name).click().wait(500);

  cy.get('[data-cy="delete_product_button"]').click().wait(100);

  cy.get('.toggle').click().wait(500);

  cy.get('.miller__col__item').contains(testDepartment.name).click().wait(750);

  cy.get('.miller__col__item').contains(testProducts[productIndex].name).click().wait(750);

  cy.get('[data-cy="permanently-delete-object"]').click();
});
