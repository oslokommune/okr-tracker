import store from '@/store';

/**
 * Router guard for admin pages for organizations, departments and products.
 * Checks if the user is an admin or a member of the team before allowing access to the page.
 */
export default async function itemAdmin(to, from, next) {
  const {
    state: {
      activeItem: { team, organization, id: activeItemId },
      user: { id: userId, superAdmin, admin },
    },
  } = store;

  const isAdminOfOrganization = organization
    ? admin.includes(organization.id)
    : admin.includes(activeItemId);

  const isMemberOfTeam = team && team.map(({ id }) => id).includes(userId);

  if (isMemberOfTeam || superAdmin || isAdminOfOrganization) {
    next();
  } else {
    console.error('Access denied');
    next(false);
  }
}
