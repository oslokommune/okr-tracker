import { readFileSync } from 'fs';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { emulators } from '../../firebase.json';
import {
  withUnauthenticatedUser,
  withAuthenticatedUser,
  expectPermissionDenied,
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

      await users
        .doc('superadmin@example.com')
        .set({ name: 'Super Admin', superAdmin: true });
      await users.doc('user@example.com').set({ name: 'User' });
      await users.doc('user2@example.com').set({ name: 'User 2' });

      await organizations
        .doc('organization')
        .set({ name: 'Organization', team: [users.doc('user@example.com')] });
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
    await withAuthenticatedUser(testEnv, 'user@example.com', async (db) => {
      const user = db.collection('users').doc('user2@example.com');
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
});

afterAll(async () => {
  // Destroy all RulesTestContexts created in test environment and
  // clean up the underlying resources, allowing a clean exit.
  await testEnv.cleanup();
});
