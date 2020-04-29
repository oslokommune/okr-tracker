import { testProducts } from '../../config';

describe('Add user to product', () => {
  it('Navigates to edit page for product one', () => {
    cy.visit(`/product/${testProducts[0].slug}/edit`).wait(2000);

    cy.get('[data-cy="product_name_field"]').should('have.value', testProducts[0].name);
  });

  it('Adds test user to product one', () => {
    cy.get('[data-cy="team_field"]')
      .click()
      .type(Cypress.env('VUE_APP_TESTUSER_USER'))
      .get('.vs__dropdown-menu > li')
      .click();
  });

  it('Saves the product', () => {
    cy.get('[data-cy="save_product_button"]')
      .should('not.be.disabled')
      .click();

    cy.get('.toasted').should('contain', 'Lagret');
  });
});
