<template>
  <div>
    <pre>{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="org in orgs" :key="org.id">
        <pre>{{ org }}</pre>

        <input v-model="org.name" />

        <button @click="update(org)">Update</button>
        <button v-if="!org.archived" @click="archive(org)">Archive</button>
        <button v-if="org.archived" @click="restore(org)">Restore</button>
      </li>

      <hr />
      <button @click="logout">Logout</button>
    </ul>

    <button v-if="!user" @click="login">Login</button>
  </div>
</template>

<script>
import { auth, loginProvider, db } from '@/config/firebaseConfig';
import Org from '@/db/organisations';

export default {
  data: () => ({
    orgs: [],
  }),

  computed: {
    user() {
      return this.$store.state.user;
    },
  },

  firestore: {
    orgs: db.collection('orgs'),
  },

  methods: {
    async update({ id, ...data }) {
      try {
        await new Org(id).update(data);
      } catch {
        console.error('err');
      }
    },

    async archive({ id }) {
      await new Org(id).archive();
    },

    async restore({ id }) {
      await new Org(id).restore();
    },

    logout() {
      auth.signOut();
    },

    login() {
      auth.signInWithPopup(loginProvider).catch(error => {
        console.error(error);
      });
    },
  },
};
</script>
