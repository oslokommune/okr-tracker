import { testOrganization, testPeriod, testObjective, testKeyResult } from '../../config';

describe('Create department', () => {
  before(() => {
    cy.visit('/').wait(200);
  });

  it('Creates a new organization', () => {
    cy.createTestOrg();
  });

  it('Validates the newly created org', () => {
    cy.visit(`/${testOrganization.slug}`);

    cy.get('.sub-nav').should('be.empty');

    cy.get('.title-1').should('contain', testOrganization.name);
    cy.get('.team__list').should('be.empty');
    cy.get('[data-cy="mission_statement"]').should(
      'contain',
      testOrganization.mission_statement
    );
    cy.get('[data-cy="objectives_list"] .title').should('contain', '(0)');
  });
});

describe('Create data for organization', () => {
  it('Navigates to edit page', () => {
    cy.get('[data-cy="edit_object_link"]').click();

    cy.get('[data-cy="org-name"]').should('have.value', testOrganization.name);

    cy.get('[data-cy="admin-okr"]').click();
  });

  it('Creates a new period with mock data', () => {
    cy.get('[data-cy="okr-create-period"]').click();

    cy.get('[data-cy="period_name"]').clear().type(testPeriod.name);

    cy.get('[input="hidden"]').type(testPeriod.date);

    cy.get('[data-cy="save_period"]').click();
  });

  it('Creates an objective for the period', () => {
    cy.get('[data-cy="okr-create-objective"]').click();

    cy.get('[data-cy="objective_name_field"]').clear().type(testObjective.name);

    cy.get('[data-cy="objective_description_field"]')
      .clear()
      .type(testObjective.description);

    cy.get('[data-cy="save_objective_button"]').click();
  });

  it('Creates a key result for the objective', () => {
    cy.get('[data-cy="okr-create-keyResult"]').click().wait(750);

    cy.get('[data-cy="keyResult_name_field"]').clear().type(testKeyResult.name);

    cy.get('[data-cy="keyResult_longdescription_field"]')
      .clear()
      .type(testKeyResult.longDescription);

    cy.get('[data-cy="keyResult_startvalue_field"]')
      .clear()
      .type(testKeyResult.startValue);

    cy.get('[data-cy="keyResult_targetvalue_field"]')
      .clear()
      .type(testKeyResult.targetValue);

    cy.get('[data-cy="keyResult_unit_field"]').clear().type(testKeyResult.unit);

    cy.get('[data-cy="save_keyResult_button"]').click();
  });
});
