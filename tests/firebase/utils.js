import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

export async function withUnauthenticatedUser(env, callback) {
  const db = env.unauthenticatedContext().firestore();
  await callback(db);
}

export async function withAuthenticatedUser(env, userId, callback) {
  const db = env.authenticatedContext(userId, { email: userId }).firestore();
  await callback(db);
}

export async function expectPermissionDenied(promise) {
  const errorResult = await assertFails(promise);
  expect(errorResult.code).toBe('permission-denied' || 'PERMISSION_DENIED');
}

export async function expectAddSucceeds(promise) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).not.toBeUndefined();
  return successResult;
}

export async function expectUpdateSucceeds(promise) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).toBeUndefined();
}

export async function expectGetSucceeds(promise) {
  const successResult = await assertSucceeds(promise);
  expect(successResult).not.toBeUndefined();
  return successResult;
}
