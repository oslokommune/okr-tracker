<template>
  <div>
    <table>
      <tr v-for="(user, key) in list" :key="key">
        <td><input type="checkbox" :checked="user.admin" @change="toggleAdmin(key, $event.target.checked)" /></td>
        <td>{{ key }}</td>
        <td><button @click="deleteEmail(key)">Slett</button></td>
      </tr>
    </table>

    <hr />
    <h3 class="title title-3">Legg til e-post-adresser</h3>
    <p>Én adresse per rad</p>
    <textarea rows="10" ref="add"></textarea>
    <button @click="addEmails">Legg til</button>
  </div>
</template>

<script>
import { validateEmail } from '@/util/formValidation';
import { db, usersCollection } from '@/config/firebaseConfig';

export default {
  name: 'Admin',

  data: () => ({
    list: {},
  }),

  methods: {
    addEmails() {
      const list = this.$refs.add.value
        .trim()
        .split('\n')
        .filter(Boolean)
        .filter(validateEmail);

      list.forEach(email => {
        db.collection('users')
          .doc(email)
          .set({ admin: false });
      });
    },

    deleteEmail(key) {
      usersCollection.doc(key).delete();
    },

    toggleAdmin(key, value) {
      usersCollection.doc(key).update({ admin: value });
    },
  },

  mounted() {
    usersCollection.onSnapshot(snapshot => {
      const list = {};
      snapshot.docs.forEach(doc => {
        list[doc.id] = doc.data();
      });
      this.list = list;
    });
  },
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
}

input[type='checkbox'] {
  // margin-right: 10px;
}
</style>
