import { readFileSync } from 'fs';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { emulators } from '../../firebase.json';
import {
  withUnauthenticatedUser,
  withAuthenticatedUser,
  expectPermissionDenied,
  expectAddSucceeds,
  expectUpdateSucceeds,
  expectGetSucceeds,
} from './utils';

const PROJECT_ID = 'firestore-tests';
let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      port: emulators.firestore.port,
      host: '127.0.0.1',
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

describe('Test Firestore rules', () => {
  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      const users = db.collection('users');
      const organizations = db.collection('organizations');
      const departments = db.collection('departments');
      const products = db.collection('products');
      const objectives = db.collection('objectives');
      const objectiveContributors = db.collection('objectiveContributors');
      const apiClients = db.collection('apiClients');

      await users
        .doc('superadmin@example.com')
        .set({ name: 'Super Admin', superAdmin: true });
      await users
        .doc('orgadmin@example.com')
        .set({ name: 'Org Y Admin', admin: ['organization-y'] });
      await users
        .doc('user@example.com')
        .set({ name: 'User', admin: ['organization-x'] });
      await users.doc('user2@example.com').set({ name: 'User 2' });
      await users.doc('user3@example.com').set({ name: 'User 3' });

      await organizations
        .doc('organization-x')
        .set({ name: 'Organization X', team: [users.doc('user@example.com')] });
      await organizations.doc('organization-y').set({ name: 'Organization Y' });

      await departments.doc('department-x1').set({
        name: 'Department X1',
        team: [users.doc('user2@example.com')],
        organization: organizations.doc('organization-x'),
      });
      await departments.doc('department-y1').set({
        name: 'Department Y1',
        organization: organizations.doc('organization-y'),
      });

      await products.doc('product-x1').set({
        name: 'Product X1',
        team: [users.doc('user3@example.com')],
        organization: organizations.doc('organization-x'),
        department: departments.doc('department-x1'),
      });
      await products.doc('product-y1').set({
        name: 'Product Y1',
        organization: organizations.doc('organization-y'),
        department: departments.doc('department-y1'),
      });

      await objectives.doc('department-x1-objective-1').set({
        name: 'Department X1 - Objective 1',
        parent: departments.doc('department-x1'),
      });
      await objectives.doc('department-y1-objective-1').set({
        name: 'Department Y1 - Objective 1',
        parent: departments.doc('department-y1'),
      });
      await objectives.doc('product-x1-objective-1').set({
        name: 'Product X1 - Objective 1',
        parent: products.doc('product-x1'),
      });

      await objectiveContributors.doc('objective-contributor-1').set({
        objective: objectives.doc('department-x1-objective-1'),
        item: objectives.doc('product-x1'),
      });

      await apiClients
        .doc('organization-api-client')
        .set({ parent: organizations.doc('organization-x'), clientId: 'foo' });
      await apiClients
        .doc('organization-api-client')
        .collection('secrets')
        .doc('organization-api-client-secret')
        .set({ secret: 'bar' });
    });
  });

  test('anonymous users cannot read user profile', async () => {
    await withUnauthenticatedUser(testEnv, async (db) => {
      const user = db.collection('users').doc('user@example.com');
      await expectPermissionDenied(user.get());
    });
  });

  test('users can read user other profiles', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const user = db.collection('users').doc('user2@example.com');
      const result = await expectGetSucceeds(user.get());
      expect(result.data().name).toBe('User 2');
    });
  });

  test('users cannot delete other users', async () => {
    await withAuthenticatedUser(testEnv, 'user2@example.com', async (db) => {
      const user = db.collection('users').doc('user3@example.com');
      await expect(user.get()).resolves.toHaveProperty('exists', true);
      await expectPermissionDenied(user.delete());
      await expect(user.get()).resolves.toHaveProperty('exists', true);
    });
  });

  test('super admin can delete any user', async () => {
    await withAuthenticatedUser(testEnv, 'superadmin@example.com', async (db) => {
      const user = db.collection('users').doc('user2@example.com');
      await expect(user.get()).resolves.toHaveProperty('exists', true);
      await expectUpdateSucceeds(user.delete());
      await expect(user.get()).resolves.toHaveProperty('exists', false);
    });
  });

  test('users can delete themselves', async () => {
    const userId = 'user@example.com';
    await withAuthenticatedUser(testEnv, userId, async (db) => {
      const user = db.collection('users').doc(userId);
      await expectUpdateSucceeds(user.delete());
    });
  });

  test('anonymous users cannot read organizations', async () => {
    await withUnauthenticatedUser(testEnv, async (db) => {
      const organizations = db.collection('organizations');
      await expectPermissionDenied(organizations.get());
    });
  });

  test('users can read organizations', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const organizations = db.collection('organizations');
      await expectGetSucceeds(organizations.get());
    });
  });

  test('users cannot create organizations', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const organizations = db.collection('organizations');
      await expectPermissionDenied(organizations.add({ foo: 'bar' }));
    });
  });

  test('users cannot update organizations', async () => {
    await withAuthenticatedUser(testEnv, 'user2@example.com', async (db) => {
      const organization = db.collection('organizations').doc('organization-x');
      await expectPermissionDenied(organization.update({ name: 'Org X' }));
    });
  });

  test('users cannot delete organizations', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const organization = db.collection('organizations').doc('organization-x');
      await expectPermissionDenied(organization.delete());
    });
  });

  test('organization admin can update own organization', async () => {
    await withAuthenticatedUser(testEnv, 'orgadmin@example.com', async (db) => {
      const organizationX = db.collection('organizations').doc('organization-x');
      const organizationY = db.collection('organizations').doc('organization-y');
      await expectPermissionDenied(organizationX.update({ name: 'Org X' }));
      await expectUpdateSucceeds(organizationY.update({ name: 'Org Y' }));
      expect((await organizationX.get()).data().name).toBe('Organization X');
      expect((await organizationY.get()).data().name).toBe('Org Y');
    });
  });

  test('organization admin can update own child departments and products', async () => {
    await withAuthenticatedUser(testEnv, 'orgadmin@example.com', async (db) => {
      const departmentX1 = db.collection('departments').doc('department-x1');
      const departmentY1 = db.collection('departments').doc('department-y1');
      const productX1 = db.collection('products').doc('product-x1');
      const productY1 = db.collection('products').doc('product-y1');
      await expectPermissionDenied(departmentX1.update({ name: 'Dep X1' }));
      await expectUpdateSucceeds(departmentY1.update({ name: 'Dep Y1' }));
      await expectPermissionDenied(productX1.update({ name: 'Prod X1' }));
      await expectUpdateSucceeds(productY1.update({ name: 'Prod Y1' }));
      expect((await departmentX1.get()).data().name).toBe('Department X1');
      expect((await departmentY1.get()).data().name).toBe('Dep Y1');
      expect((await productX1.get()).data().name).toBe('Product X1');
      expect((await productY1.get()).data().name).toBe('Prod Y1');
    });
  });

  test('anonymous users cannot read objective contributors', async () => {
    await withUnauthenticatedUser(testEnv, async (db) => {
      const oc = db.collection('objectiveContributors').doc('objective-contributor-1');
      await expectPermissionDenied(oc.get());
    });
  });

  test('users can read objective contributors', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      await expectGetSucceeds(objectiveContributors.get());
    });
  });

  test('anonymous users cannot create objective contributors', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      await expectPermissionDenied(objectiveContributors.add({ foo: 'bar' }));
    });
  });

  test('organization admins can create objective contributors', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      const departments = db.collection('departments');
      const objectives = db.collection('objectives');

      await expectAddSucceeds(
        objectiveContributors.add({
          objective: objectives.doc('department-x1-objective-1'),
          item: departments.doc('department-x1'),
        })
      );
    });
  });

  test('organization admins cannot create objective contributors in other organizations', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      const departments = db.collection('departments');
      const objectives = db.collection('objectives');

      await expectPermissionDenied(
        objectiveContributors.add({
          objective: objectives.doc('department-y1-objective-1'),
          item: departments.doc('department-y1'),
        })
      );
    });
  });

  test('users can create objective contributors for their own objectives', async () => {
    await withAuthenticatedUser(testEnv, 'user2@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      const departments = db.collection('departments');
      const objectives = db.collection('objectives');

      await expectAddSucceeds(
        objectiveContributors.add({
          objective: objectives.doc('department-x1-objective-1'),
          item: departments.doc('department-x1'),
        })
      );
    });
  });

  test("users can create objective contributors for objectives on their item's parent item", async () => {
    await withAuthenticatedUser(testEnv, 'user3@example.com', async (db) => {
      const objectiveContributors = db.collection('objectiveContributors');
      const products = db.collection('products');
      const objectives = db.collection('objectives');

      await expectAddSucceeds(
        objectiveContributors.add({
          objective: objectives.doc('department-x1-objective-1'),
          item: products.doc('product-x1'),
        })
      );
    });
  });

  test('anonymous users cannot read api clients', async () => {
    await withUnauthenticatedUser(testEnv, async (db) => {
      const clients = db.collection('apiClients');
      await expectPermissionDenied(clients.get());
    });

    await withUnauthenticatedUser(testEnv, async (db) => {
      const client = db.collection('apiClients').doc('organization-api-client');
      await expectPermissionDenied(client.get());
    });
  });

  test('signed in users can read api clients', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const orgRef = db.collection('organizations').doc('organization-x');
      const clients = db.collection('apiClients').where('parent', '==', orgRef);
      const result = await expectGetSucceeds(clients.get());
      expect(result).toHaveProperty('size', 1);
    });
  });

  test('members can write own api clients and secrets', async () => {
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const apiClientRef = db.collection('apiClients').doc('organization-api-client');
      await expectUpdateSucceeds(apiClientRef.update({ name: 'foo' }));
      const apiClientSnap = await apiClientRef.get();
      expect(apiClientSnap.data().name).toBe('foo');
      const secrets = apiClientRef.collection('secrets');
      await expectUpdateSucceeds(secrets.doc('foo').set({ foo: 'bar' }));
    });

    await withAuthenticatedUser(testEnv, 'user2@example.com', async (db) => {
      const apiClientRef = db.collection('apiClients').doc('organization-api-client');
      await expectPermissionDenied(apiClientRef.update({ name: 'foo' }));
    });
  });

  test('super admin can write any api client', async () => {
    await withAuthenticatedUser(testEnv, 'superadmin@example.com', async (db) => {
      const clients = db.collection('apiClients');
      const apiClientRef = clients.doc('organization-api-client');
      await expectUpdateSucceeds(apiClientRef.update({ name: 'foo' }));
      const secrets = apiClientRef.collection('secrets');
      await expectUpdateSucceeds(secrets.doc('foo').set({ foo: 'bar' }));
    });
  });

  test('no one can read api client secrets', async () => {
    async function readApiClientSecrets(db) {
      const apiClients = db.collection('apiClients');
      const apiClientRef = apiClients.doc('organization-api-client');
      const apiClientSecrets = apiClientRef.collection('secrets');
      await expectPermissionDenied(apiClientSecrets.get());

      const apiClientSecretRef = apiClientRef
        .collection('secrets')
        .doc('organization-api-client-secret');
      await expectPermissionDenied(apiClientSecretRef.get());
    }

    await withUnauthenticatedUser(testEnv, readApiClientSecrets);
    await withAuthenticatedUser(testEnv, 'user@example.com', readApiClientSecrets);
    await withAuthenticatedUser(testEnv, 'superadmin@example.com', readApiClientSecrets);
  });
});

afterAll(async () => {
  // Destroy all RulesTestContexts created in test environment and
  // clean up the underlying resources, allowing a clean exit.
  await testEnv.cleanup();
});
