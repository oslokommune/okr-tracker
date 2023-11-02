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
      const apiClients = db.collection('apiClients');

      await users
        .doc('superadmin@example.com')
        .set({ name: 'Super Admin', superAdmin: true });
      await users.doc('user@example.com').set({ name: 'User' });
      await users.doc('user2@example.com').set({ name: 'User 2' });

      await organizations
        .doc('organization')
        .set({ name: 'Organization', team: [users.doc('user@example.com')] });

      await apiClients
        .doc('organization-api-client')
        .set({ parent: organizations.doc('organization'), clientId: 'foo' });
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
      const orgRef = db.collection('organizations').doc('organization');
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
