import { testObjective, testProducts, testKeyResult } from '../config';

Cypress.Commands.add('createKeyres', (index) => {
  cy.visit(`/product/${testProducts[index].slug}`)
    .wait(1500)
    .get('[data-cy="add_keyResult"]')
    .click()
    .wait(100)
    .get('.popout [data-cy="objective_selector"] .vs__dropdown-toggle')
    .click()
    .type(testObjective.name)
    .type('{enter}')
    .get('[data-cy="keyResult_name_field"]')
    .clear()
    .type(testKeyResult.name)
    .get('[data-cy="keyResult_description_field"]')
    .clear()
    .type(testKeyResult.longDescription)
    .get('[data-cy="keyResult_startvalue_field"]')
    .clear()
    .type(testKeyResult.startValue)
    .get('[data-cy="keyResult_targetvalue_field"]')
    .clear()
    .type(testKeyResult.targetValue)
    .get('[data-cy="keyResult_unit_field"]')
    .clear()
    .type(testKeyResult.unit);

  cy.get('[data-cy="save_keyResult_button"]').click().wait(1200);
});
