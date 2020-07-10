<template>
  <button data-cy="delete_test_data" @click="deleteTestData">Delete test data</button>
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  computed: {
    me() {
      return this.$store.state.user.ref;
    },
  },

  methods: {
    async deleteTestData() {
      const testUserIds = [process.env.VUE_APP_TESTADMIN_USER, process.env.VUE_APP_TESTUSER_USER];

      const testUserRefs = await getUserRefsFromIds(testUserIds);

      db.collection('audit')
        .where('user', 'in', testUserIds)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.ref.delete()));

      db.collectionGroup('objectives')
        .where('createdBy', 'in', testUserRefs)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.ref.delete()));

      db.collectionGroup('keyResults')
        .where('createdBy', 'in', testUserRefs)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.ref.delete()));

      db.collectionGroup('progress')
        .where('createdBy', 'in', testUserRefs)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.ref.delete()));

      db.collectionGroup('periods')
        .where('createdBy', 'in', testUserIds)
        .get()
        .then(snapshot => snapshot.docs.forEach(doc => doc.ref.delete()));
    },
  },
};

function getUserRefsFromIds(ids) {
  const promises = ids.map(id =>
    db
      .collection('users')
      .doc(id)
      .get()
      .then(d => d.ref)
  );

  return Promise.all(promises);
}
</script>
