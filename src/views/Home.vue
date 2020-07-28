<template>
  <div>
    <pre>{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="org in departments" :key="org.id">
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
import Dept from '@/db/departments';

export default {
  data: () => ({
    departments: [],
  }),

  computed: {
    user() {
      return this.$store.state.user;
    },
  },

  watch: {
    orgs: {
      immediate: true,
      handler() {
        this.$bind('departments', db.collection('departments'), { maxRefDepth: 1 });
      },
    },
  },

  methods: {
    async update({ id, ...data }) {
      try {
        await new Dept(id).update(data);
      } catch (error) {
        console.error('err', error);
      }
    },

    async archive({ id }) {
      await new Dept(id).archive();
    },

    async restore({ id }) {
      await new Dept(id).restore();
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
