import {
  testProducts,
  testDepartment,
  testObjective,
  testKeyResult,
  testPeriod,
} from '../../config';

describe('Verifies restrictions for test user', () => {
  before(() => {
    cy.visit('/').wait(1000);
  });

  it('Logs in as test user', () => {
    cy.get('input[type="password"]').type(
      Cypress.env('VITE_TESTUSER_PASSWORD')
    );
    cy.get('form').submit();
    cy.wait(1000);

    cy.visit('/me')
      .wait(1000)
      .get('.page-header__name')
      .should('contain', Cypress.env('VITE_TESTUSER_USER'));
  });

  it('Verifies team membership (Product one)', () => {
    cy.get('.product')
      .should('contain', testDepartment.name)
      .should('contain', testProducts[0].name)
      .click()
      .wait(1000);
  });

  it('Verifies contents on product page (Product One)', () => {
    cy.get('.sidebar-nav')
      .should('contain', 'Endre produkt')
      .should('contain', 'Legg til mål')
      .should('contain', 'Nytt nøkkelresultat')
      .should('contain', 'Oppdater data');

    cy.get('[data-cy="mission_statement"]').should(
      'contain',
      testProducts[0].mission_statement
    );

    cy.get('.sub-nav').should('contain', testPeriod.name);

    cy.get('.team__list').should('contain', Cypress.env('VITE_TESTUSER_USER'));

    cy.get('.list')
      .should('contain', testObjective.name)
      .should('contain', testObjective.description)
      .should('contain', testKeyResult.name)
      .should('contain', testKeyResult.startValue)
      .should('contain', testKeyResult.targetValue)
      .should('contain', testKeyResult.unit);
  });

  it('Allows test user to edit Product One', () => {
    cy.get('[data-cy="edit_object_link"]').click().wait(500);

    cy.get('[data-cy="product_name_field"]').should(
      'have.value',
      testProducts[0].name
    );

    cy.get('[data-cy="product_mission_statement_field"]')
      .clear()
      .type(testProducts[0].edited_mission_statement);

    cy.get('[data-cy="save_product_button"]').should('not.be.disabled').click();

    cy.get('.toasted').should('contain', 'Lagret');
  });

  it('Verifies the changed Product', () => {
    cy.visit(`/product/${testProducts[0].slug}`).wait(1000);

    cy.get('[data-cy="mission_statement"]').should(
      'contain',
      testProducts[0].edited_mission_statement
    );
  });

  it('Allows updating progress for Product one (using modal)', () => {
    cy.get('[data-cy="update_data"]').click().wait(4500);

    cy.get('.modal')
      .should('contain', testKeyResult.name)
      .should('contain', testKeyResult.startValue)
      .should('contain', testKeyResult.targetValue)
      .should('contain', testKeyResult.unit);

    cy.get('[data-cy="value_field"]').clear().type(testKeyResult.targetValue);

    cy.get('[data-cy="save_button"]').click();

    cy.get('.toasted').should('contain', 'Lagt til ny verdi');
  });

  it('Cannot edit Product two', () => {
    cy.visit(`/product/${testProducts[1].slug}`).wait(1000);

    cy.get('[data-cy="mission_statement"]').should(
      'contain',
      testProducts[1].mission_statement
    );

    cy.get('.list')
      .should('contain', testObjective.name)
      .should('contain', testObjective.description)
      .should('contain', testKeyResult.name)
      .should('contain', testKeyResult.startValue)
      .should('contain', testKeyResult.targetValue)
      .should('contain', testKeyResult.unit);

    cy.get('.sidebar-nav')
      .should('not.contain', 'Endre produkt')
      .should('not.contain', 'Legg til mål')
      .should('not.contain', 'Nytt nøkkelresultat')
      .should('not.contain', 'Oppdater data');

    cy.visit(`/product/${testProducts[1].slug}/edit`)
      .wait(2000)
      .url()
      .should('not.include', testProducts[1].slug);
  });

  it('Cannot access admin page', () => {
    cy.visit(`/admin`).wait(1000).url().should('not.include', 'admin');
  });

  it('Cannot edit department', () => {
    cy.visit(`/`)
      .wait(1000)
      .get('.department > a')
      .contains(testDepartment.name)
      .click()
      .wait(1000);

    cy.get('.sidebar-nav')
      .should('not.contain', 'Endre produkt')
      .should('not.contain', 'Legg til mål')
      .should('not.contain', 'Nytt nøkkelresultat')
      .should('not.contain', 'Oppdater data')
      .should('contain', 'Vis medlemmer');
  });

  it('Logs out as test user', () => {
    cy.signOut();
  });
});
