import { testObjective, testProducts, testKeyResult } from '../config';

Cypress.Commands.add('createKeyres', (index) => {
  cy.visit(`/product/${testProducts[index].slug}`)
    .wait(1500)
    .get('[data-cy="add_keyres"]')
    .click()
    .wait(100)
    .get('.popout [data-cy="objective_selector"] .vs__dropdown-toggle')
    .click()
    .type(testObjective.name)
    .type('{enter}')
    .get('[data-cy="keyres_name_field"]')
    .clear()
    .type(testKeyResult.name)
    .get('[data-cy="keyres_description_field"]')
    .clear()
    .type(testKeyResult.longDescription)
    .get('[data-cy="keyres_startvalue_field"]')
    .clear()
    .type(testKeyResult.startValue)
    .get('[data-cy="keyres_targetvalue_field"]')
    .clear()
    .type(testKeyResult.targetValue)
    .get('[data-cy="keyres_unit_field"]')
    .clear()
    .type(testKeyResult.unit);

  cy.get('[data-cy="save_keyres_button"]').click().wait(1200);
});
