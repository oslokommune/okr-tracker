import store from '@/store';

/**
 * Router guard for admin pages for organizations, departments and products.
 * Checks if the user is an admin or a member of the team before allowing access to the page.
 */
export default async function (to, from, next) {
  const {
    state: {
      activeItem: { team },
      user: { admin, id: userId },
    },
  } = store;

  const isMemberOfTeam = team && team.map(({ id }) => id).includes(userId);

  if (admin || isMemberOfTeam) {
    next();
  } else {
    console.error('Access denied');
    next(false);
  }
}
