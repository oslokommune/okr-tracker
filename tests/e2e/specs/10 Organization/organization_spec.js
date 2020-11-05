import { testOrganization } from '../../config';

describe('Create department', () => {
  before(() => {
    cy.visit('/').wait(200);
  });

  it('Creates a new department', () => {
    cy.createTestOrg();
  });

  it('Validates the newly created org', () => {
    cy.visit(`/${testOrganization.slug}`);

    cy.get('.sub-nav').should('be.empty');

    cy.get('.title-1').should('contain', testOrganization.name);
    cy.get('.team__list').should('be.empty');
    cy.get('[data-cy="mission_statement"]').should('contain', testOrganization.mission_statement);
    cy.get('[data-cy="objectives_list"] .title').should('contain', '(0)');
  });
});

describe('Create data for department', () => {
  it('Navigates to edit page', () => {
    cy.get('[data-cy="edit_object_link"]').click().wait(750);

    cy.get('[data-cy="dep-name"]').should('have.value', testDepartment.name);

    cy.get('[data-cy="objectives_key_results_tab"]').click().wait(750);
  });

  it('Creates a new period with mock data', () => {
    cy.get('[data-cy="add_period_button"]').click().wait(750);

    cy.get('[data-cy="period_name"]').clear().type(testPeriod.name);

    cy.get('[data-cy="save_period"]').click();
  });

  it('Creates an objective for the period', () => {
    cy.get('[data-cy="add_objective_button"]').click().wait(750);

    cy.get('[data-cy="objective_name_field"]').clear().type(testObjective.name);

    cy.get('[data-cy="objective_description_field"]').clear().type(testObjective.description);

    cy.get('[data-cy="save_objective_button"]').click();
  });

  it('Creates a key result for the objective', () => {
    cy.get('[data-cy="add_keyres_button"]').click().wait(750);

    cy.get('[data-cy="keyres_name_field"]').clear().type(testKeyResult.name);

    cy.get('[data-cy="keyres_longdescription_field"]').clear().type(testKeyResult.longDescription);

    cy.get('[data-cy="keyres_startvalue_field"]').clear().type(testKeyResult.startValue);

    cy.get('[data-cy="keyres_targetvalue_field"]').clear().type(testKeyResult.targetValue);

    cy.get('[data-cy="keyres_unit_field"]').clear().type(testKeyResult.unit);

    cy.get('[data-cy="save_keyres_button"]').click();
  });
});
