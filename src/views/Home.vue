<template>
  <div>
    <pre v-if="user">{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="item in products" :key="item.id">
        <pre>{{ item }}</pre>

        <input v-model="item.name" />

        <button @click="update(item)">Update</button>
        <button v-if="!item.archived" @click="archive(item)">Archive</button>
        <button v-if="item.archived" @click="restore(item)">Restore</button>
        <button v-if="item.archived" @click="del(item)">Delete</button>
      </li>

      <hr />
      <button @click="logout">Logout</button>
    </ul>

    <button v-if="!user" @click="login">Login</button>
  </div>
</template>

<script>
import { auth, loginProvider, db } from '@/config/firebaseConfig';
import Product from '@/db/Product';

export default {
  data: () => ({
    products: [],
  }),

  computed: {
    user() {
      return this.$store.state.user;
    },
  },

  created() {
    this.$bind('products', db.collection('products'), { maxRefDepth: 0 });
  },

  methods: {
    async update({ id, ...data }) {
      try {
        await new Product(id).update(data);
      } catch (error) {
        console.error('err', error);
      }
    },

    async archive({ id }) {
      await new Product(id).archive();
    },

    async restore({ id }) {
      await new Product(id).restore();
    },

    async del({ id }) {
      await new Product(id).delete();
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
