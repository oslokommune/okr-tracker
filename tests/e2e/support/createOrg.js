import { testOrganization } from '../config';

Cypress.Commands.add('createTestOrg', () => {
  cy.visit('/admin');

  cy.get('[data-cy="create-organization"]').click();

  cy.url().should('include', '/admin/create-organization');

  cy.get('[data-cy="org-name"]').clear().type(testOrganization.name);

  cy.get('[data-cy="org-missionStatement"]').clear().type(testOrganization.mission_statement);

  cy.get('[data-cy="btn-createOrg"]').click();

  cy.wait(5000);

  cy.url().should('include', '/test-org');
});
