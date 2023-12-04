import isAdmin from '../../../src/util/user';

describe('Test admin check', () => {
  test('unconfigured user is not an admin', () => {
    expect(isAdmin({})).toBe(false);
  });
  test('super admin is an admin', () => {
    expect(isAdmin({ superAdmin: true })).toBe(true);
  });
  test('non-super admin is not an admin', () => {
    expect(isAdmin({ superAdmin: false })).toBe(false);
  });
  test('falsy admin is not an admin', () => {
    expect(isAdmin({ admin: false })).toBe(false);
  });
  test('empty admin is not an admin', () => {
    expect(isAdmin({ admin: [] })).toBe(false);
  });
  test('admin of something is an admin', () => {
    expect(isAdmin({ admin: ['foo-corp'] })).toBe(true);
  });
  test('admin of several things is an admin', () => {
    expect(isAdmin({ admin: ['foo-corp', 'bar-corp'] })).toBe(true);
  });
});
