import { testDepartment, testProducts } from '../config';

Cypress.Commands.add('createProduct', (productIndex) => {
  cy.visit('/admin').wait(2000);

  cy.get('[data-cy="admin-depsAndProds"]').click().wait(1000);

  cy.url().should('include', '/admin/data');

  cy.get('.miller__col__item').contains(testDepartment.name).click().wait(500);

  cy.get('[data-cy="admin-addProduct"]').click().wait(1000);

  cy.get('[data-cy="product_name_field"]').clear().type(testProducts[productIndex].name);

  cy.get('[data-cy="product_mission_statement_field"]').clear().type(testProducts[productIndex].mission_statement);

  cy.get('[data-cy="save_product_button"]').click();
});
