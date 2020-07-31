<template>
  <div>
    <pre v-if="user">{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="item in departments" :key="item.id">
        <pre>{{ item }}</pre>

        <input v-model="item.name" />

        <button @click="update(item)">Update</button>
        <button v-if="!item.archived" @click="archive(item)">Archive</button>
        <button v-if="item.archived" @click="restore(item)">Restore</button>
        <button v-if="item.archived" @click="deleteDeep(item)">Delete</button>
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
import Department from '@/db/Department';

export default {
  data: () => ({
    departments: [],
  }),

  computed: {
    user() {
      return this.$store.state.user;
    },
  },

  created() {
    this.$bind('departments', db.collection('departments'), { maxRefDepth: 0 });
  },

  methods: {
    async update({ id, ...data }) {
      delete data.organization;
      try {
        await Department.update(id, data);
      } catch (error) {
        console.error('err', error);
      }
    },

    async create() {
      await Department.create({
        name: 'MyDepartment from UI',
        organization: db.doc('organizations/ggHgxEEcjBOOtJuyvIwc'),
      }).catch(() => {
        console.log('showing error in UI');
      });
    },

    async archive({ id }) {
      await Department.archive(id);
    },

    async restore({ id }) {
      await Department.restore(id);
    },

    async deleteDeep({ id }) {
      await Department.deleteDeep(id);
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
