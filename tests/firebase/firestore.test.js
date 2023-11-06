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

      await users
        .doc('superadmin@example.com')
        .set({ name: 'Super Admin', superAdmin: true });
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
        department: organizations.doc('department-x'),
      });

      await objectives.doc('department-x1-objective-1').set({
        name: 'Department X1 - Objective 1',
        parent: departments.doc('department-x1'),
      });
      await objectives.doc('department-y1-objective-1').set({
        name: 'Department Y1 - Objective 1',
        parent: departments.doc('department-y1'),
      });

      await objectiveContributors.doc('objective-contributor-1').set({
        objective: objectives.doc('department-x1-objective-1'),
        item: objectives.doc('product-x1'),
      });
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
      const result = await user.get();
      expectGetSucceeds(result);
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
});

afterAll(async () => {
  // Destroy all RulesTestContexts created in test environment and
  // clean up the underlying resources, allowing a clean exit.
  await testEnv.cleanup();
});
