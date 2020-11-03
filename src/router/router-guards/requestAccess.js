import store from '@/store';

export default async function requestAccess(to, from, next) {
  if (store.state.user) {
    next({ name: 'Home' });
  } else {
    next();
  }
}
