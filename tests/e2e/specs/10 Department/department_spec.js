import { testDepartment } from '../../config';

describe('Create department', () => {
  before(() => {
    cy.visit('/');

    cy.wait(3000);

    cy.get('body').then($body => {
      if (!$body.text().includes('Hjem')) {
        cy.signInAdminUser();
      }
    });

    cy.get('.productList').then($el => {
      if ($el.text().includes(testDepartment.name)) {
        cy.deleteTestDepartment();
      }
    });
  });

  it('Creates a new department', () => {
    cy.createTestDepartment();
  });

  it('Visits the newly created department', () => {
    cy.visit(`/department/${testDepartment.slug}`).wait(1000);

    cy.get('.sub-nav').should('be.empty');

    cy.get('.title-1').should('contain', testDepartment.name);
    cy.get('.team__list').should('be.empty');
    cy.get('[data-cy="mission_statement"]').should('contain', testDepartment.mission_statement);
    cy.get('[data-cy="objectives_list"] .title').should('contain', '(0)');
  });
});
