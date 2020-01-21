import { db, auth } from '@/config/firebaseConfig';

const write = async (obj = {}) => {
  const user = obj.user || auth.currentUser.email || null;
  db.collection('audit').add({ ...obj, user, timestamp: new Date() });
};

export default {
  async login(user) {
    return write({ event: 'login', user });
  },
  async signOut(user) {
    return write({ event: 'sign-out', user });
  },

  async keyResUpdateProgress(keyres, product, fromValue, toValue) {
    return write({ event: 'keyRes-update-progress', keyres, product, fromValue, toValue });
  },
};
