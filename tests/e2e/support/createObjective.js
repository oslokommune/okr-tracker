import { testObjective, testPeriod } from '../config';

/**
 * Assumes the current view is at objectives and key results tab on 'edit product' page
 */
Cypress.Commands.add('createObjective', () => {
  cy.get('[data-cy="add_objective"]').click().wait(500);

  cy.get('[data-cy="period_selector"]')
    .click()
    .type(testPeriod.name)
    .get('.vs__dropdown-menu > li')
    .click();

  cy.get('[data-cy="objective_title_field"]').clear().type(testObjective.name);

  cy.get('[data-cy="objective_body_field"]').clear().type(testObjective.description);

  cy.get('[data-cy="save_objective"]').click().wait(2000);
});
