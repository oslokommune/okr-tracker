/**
 * Return true if `user` is an admin, otherwise return false.
 *
 * "Admin" meaning either a super admin, or admin of any organization.
 */
function isAdmin(user) {
  return Boolean(user && (user.superAdmin || user.admin?.length > 0));
}

export default isAdmin;
