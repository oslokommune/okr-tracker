import { testDepartment, testPeriod, testObjective, testKeyResult } from '../../config';

describe('Create department', () => {
  before(() => {
    cy.visit('/').wait(200);
  });

  it('Creates a new department', () => {
    cy.createTestDepartment();
  });

  it('Validates the newly created department', () => {
    cy.visit(`/department/${testDepartment.slug}`).wait(1000);

    cy.get('.sub-nav').should('be.empty');

    cy.get('.title-1').should('contain', testDepartment.name);
    cy.get('.team__list').should('be.empty');
    cy.get('[data-cy="mission_statement"]').should(
      'contain',
      testDepartment.mission_statement
    );
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

    cy.get('[data-cy="objective_description_field"]')
      .clear()
      .type(testObjective.description);

    cy.get('[data-cy="save_objective_button"]').click();
  });

  it('Creates a key result for the objective', () => {
    cy.get('[data-cy="add_keyResult_button"]').click().wait(750);

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

  it('Validates department data', () => {
    cy.visit(`/department/${testDepartment.slug}`).wait(1000);

    cy.get('.title-1').should('contain', testDepartment.name);
    cy.get('.team__list').should('be.empty');
    cy.get('.sub-nav .router-link-active').should('contain', testPeriod.name);

    cy.get('[data-cy="objectives_list"] .title').should('contain', '(1)');

    cy.get('.keyResult').should('contain', testKeyResult.name);
    cy.get('.progress__startValue').should('contain', testKeyResult.startValue);
    cy.get('.progress__targetValue').should('contain', testKeyResult.targetValue);
    cy.get('.progress__unit').should('contain', testKeyResult.unit);

    cy.get('.progress__bar').should('have.css', 'width', '2px');
  });
});

describe('Create progress for key result', () => {
  it('Navigates to and validates key result page', () => {
    cy.get('.keyResult__name').should('contain', testKeyResult.name).click().wait(1000);

    cy.url().should('include', testDepartment.slug);

    cy.get('.breadcrumb')
      .should('contain', testDepartment.name)
      .should('contain', testObjective.name)
      .should('contain', testKeyResult.name);

    cy.get('.content--main h1.title-1').should('contain', testKeyResult.name);
    cy.get('.longDescription').should('contain', testKeyResult.longDescription);

    cy.get('.table tbody').should('be.empty');
  });

  it('Adds progression to key result', () => {
    cy.get('[data-cy="progress_value_field"]').clear().type(testKeyResult.progressValue);

    cy.get('[data-cy="today_button"]').contains('I dag').click();

    cy.get('[data-cy="add_progress_button"]').click().wait(750);

    cy.get('svg path').should('exist');

    cy.get('.table tbody')
      .should('not.be.empty')
      .should('contain', testKeyResult.progressValue)
      .should('contain', Cypress.env('VITE_TESTADMIN_USER'));
  });

  it('Verifies the progress on department page', () => {
    cy.get('.breadcrumb__item').contains(testDepartment.name).click().wait(400);

    cy.get('svg text.percent').should('contain', '50%');

    cy.get('[data-cy="objectives_list"]')
      .should('contain', '(50%)')
      .should('contain', testObjective.description);

    cy.get('.progress__current-value').should('contain', testKeyResult.progressValue);
  });

  it('Updates progress from product page (inline)', () => {
    cy.get('button.keyResult__toggle').click();

    cy.get('.keyResult__edit input')
      .clear()
      .type(`${testKeyResult.targetValue} {enter}`)
      .wait(2500);

    cy.get('svg text.percent').should('contain', '100%');

    cy.get('[data-cy="objectives_list"]')
      .should('contain', '(100%)')
      .should('contain', testObjective.description);

    cy.get('.progress__bar').should('have.class', 'completed');
  });
});
