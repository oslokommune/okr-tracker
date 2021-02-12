import store from '@/store';

export default async function login(to, from, next) {
  console.log(to);
  console.log(store.state.user);
  if (store.state.user) {
    next({
      name: 'Home',
    });
  } else {
    next();
  }
}
