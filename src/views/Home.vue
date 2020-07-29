<template>
  <div>
    <pre v-if="user">{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="item in filteredItems" :key="item.id">
        <pre>{{ item }}</pre>

        <input v-model="item.name" />

        <button @click="update(item)">Update</button>
        <button v-if="!item.archived" @click="archive(item)">Archive</button>
        <button v-if="item.archived" @click="restore(item)">Restore</button>
        <button v-if="item.archived" @click="del(item)">Delete</button>
      </li>

      <button @click="create">Create new</button>

      <hr />
      <button @click="logout">Logout</button>
    </ul>

    <button v-if="!user" @click="login">Login</button>
  </div>
</template>

<script>
import { auth, loginProvider, db } from '@/config/firebaseConfig';
import Objective from '@/db/Objective';

export default {
  data: () => ({
    objectives: [],
  }),

  computed: {
    user() {
      return this.$store.state.user;
    },

    filteredItems() {
      return this.objectives;
    },
  },

  created() {
    this.$bind('objectives', db.collection('objectives'), { maxRefDepth: 0 });
  },

  methods: {
    async update({ id, ...data }) {
      try {
        await new Objective(id).update(data);
      } catch (error) {
        console.error('err', error);
      }
    },

    async create() {
      await Objective.create({
        name: 'Hello Test',
        organization: 'organizations/testorg',
      });
    },

    async archive({ id }) {
      await new Objective(id).archive();
    },

    async restore({ id }) {
      await new Objective(id).restore();
    },

    async del({ id }) {
      await new Objective(id).delete();
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
