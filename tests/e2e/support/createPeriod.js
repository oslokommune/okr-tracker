import { testPeriod } from '../config';

/**
 * Assumes the current view is at objectives and key results tab on 'edit product' page
 */
Cypress.Commands.add('createPeriod', () => {
  cy.get('[data-cy="add_period_button"]')
    .click()
    .wait(2000);

  cy.get('[data-cy="period_name"]')
    .clear()
    .type(testPeriod.name);

  cy.get('[data-cy="save_period"]')
    .click()
    .wait(500);
});
