import { testProducts, testPeriod, testObjective } from '../../config';

describe('Create objectives', () => {
  before(() => {
    cy.visit('/').wait(3000);

    // Log in as admin if not already logged in
    cy.get('body').then(($body) => {
      if (!$body.text().includes('Hjem')) {
        cy.log('Signing in as admin user');
        cy.signInAdminUser();
      } else {
        cy.log('Already logged in');
      }
    });

    // Check if products exist
    cy.get('.productList').then(($el) => {
      if ($el.text().includes(testProducts[0].name)) {
        cy.log('Test product one exists');
      } else {
        cy.createProduct(0);
      }

      if ($el.text().includes(testProducts[1].name)) {
        cy.log('Test product two exists');
      } else {
        cy.createProduct(1);
      }
    });

    // check if periods exist
    cy.visit(`/product/${testProducts[0].slug}`)
      .get('.sub-nav')
      .then(($body) => {
        if (!$body.text().includes(testPeriod.name)) {
          cy.log('Period exists');
        } else {
          cy.visit(`/product/${testProducts[0].slug}/edit/objectives-key-results`).wait(
            1000
          );
          cy.createPeriod();
        }
      });

    // check if periods exist
    cy.visit(`/product/${testProducts[1].slug}`)
      .get('.sub-nav')
      .then(($body) => {
        if (!$body.text().includes(testPeriod.name)) {
          cy.log('Period exists');
        } else {
          cy.visit(`/product/${testProducts[1].slug}/edit/objectives-key-results`).wait(
            1000
          );
          cy.createPeriod();
        }
      });

    cy.visit(`/product/${testProducts[0].slug}`)
      .wait(3000)
      .get('[data-cy="objectives_list"]')
      .then(($body) => {
        if ($body.text().includes(testObjective.name)) {
          cy.get('[data-cy="edit_object_link"]')
            .click()
            .wait(500)
            .get('[data-cy="objectives_and_key_results_tab"]')
            .click()
            .wait(500)
            .get('.miller__col__item')
            .contains(testPeriod.name)
            .click()
            .wait(500)
            .get('.miller__col__item')
            .contains(testObjective.name)
            .click()
            .wait(500)
            .get('[data-cy="delete_objective_button"]')
            .click()
            .wait(1000);
        }
      });

    cy.visit(`/product/${testProducts[1].slug}`)
      .wait(3000)
      .get('[data-cy="objectives_list"]')
      .then(($body) => {
        if ($body.text().includes(testObjective.name)) {
          cy.get('[data-cy="edit_object_link"]')
            .click()
            .wait(500)
            .get('[data-cy="objectives_and_key_results_tab"]')
            .click()
            .wait(500)
            .get('.miller__col__item')
            .contains(testPeriod.name)
            .click()
            .wait(500)
            .get('.miller__col__item')
            .contains(testObjective.name)
            .click()
            .wait(500)
            .get('[data-cy="delete_objective_button"]')
            .click()
            .wait(1000);
        }
      });
  });

  it('Creates objective for test product one', () => {
    cy.visit(`/product/${testProducts[0].slug}`).wait(1000).createObjective();
  });

  it('Creates objective for test product two', () => {
    cy.visit(`/product/${testProducts[1].slug}`).wait(1000).createObjective();
  });
});
