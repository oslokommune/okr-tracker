import store from '../store';
import { auth, usersCollection } from '../config/firebaseConfig';

import router from '../router';

async function handleUserAuthStateChange(user) {
  if (!user) {
    store.commit('set_user', null);
  } else if (await isWhiteListed(user)) {
    usersCollection
      .doc(user.email)
      .get()
      .then(d => {
        store.commit('set_user', d.data());
      });
  } else {
    auth.signOut().then(() => {
      store.commit('set_user', null);
      router.push({ name: 'login', params: { error: true } });
    });
  }
}

async function isWhiteListed(user) {
  let list = [];
  await usersCollection.get().then(querySnapshot => {
    list = querySnapshot.docs.map(d => d.id);
  });

  return list.includes(user.email);
}

export { handleUserAuthStateChange };
