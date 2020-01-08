<template>
  <div class="container content">
    <h1 class="title title-1">Admin</h1>

    <h3 class="title title-3">Whitelist</h3>
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
import { mapState } from 'vuex';
import { validateEmail } from '../util/formValidation';
import { db, usersCollection } from '../config/firebaseConfig';

export default {
  name: 'Admin',

  data: () => ({
    list: {},
  }),

  computed: {
    ...mapState(['user']),
  },

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

  watch: {
    user(obj) {
      if (!obj) return;

      if (!this.user.admin) {
        this.$router.push('/');
      }
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
