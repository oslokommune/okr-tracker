import store from '@/store';

export default async function (to, from, next) {
  console.log(to);
  if (store.state.user) {
    next('/');
  } else {
    next();
  }
}
