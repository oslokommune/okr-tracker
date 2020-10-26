<template>
  <div v-if="user">
    <img :src="user.photoURL" :alt="user.displayName || user.id" />
    <h1 class="title-1">{{ user.displayName || user.email }}</h1>

    <div v-if="me">
      <input type="file" @input="setImage" accept="image/png, image/jpeg" />
      <button @click="uploadImage">{{ $t('btn.upload') }}</button>

      <button @click="save" :disabled="loading">{{ $t('btn.save') }}</button>
    </div>

    <div>
      <div v-for="product in products" :key="product.id">
        <router-link :to="{ name: 'ItemHome', params: { slug: product.slug } }">{{ product.name }}</router-link>
      </div>
    </div>

    <table>
      <tr v-for="event in audit" :key="event.id">
        <td>{{ formatDate(event.timestamp) }}</td>
        <td>{{ event.event }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { format } from 'date-fns';
import User from '@/db/User';

export default {
  data: () => ({
    user: null,
    products: [],
    audit: [],
    image: null,
    loading: false,
  }),

  computed: {
    me() {
      return this.$store.state.user.id === this.user.id;
    },
  },

  methods: {
    formatDate(date) {
      return format(date.toDate(), 'dd/MM/yyyy HH:mm');
    },
    setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
    },
    async uploadImage() {
      try {
        const url = await User.uploadImage(this.user.id, this.image);
        this.image = null;
        this.user.photoURL = url;
      } catch (error) {
        console.error(error);
      }
    },
    async save() {
      this.loading = true;
      try {
        await User.update(this.user);
      } catch (error) {
        console.error(error);
      }

      this.loading = false;
    },
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        const userRef = db.doc(`users/${id}`);
        const productsRef = db.collection('products').where('team', 'array-contains', userRef);
        const auditRef = db.collection('audit').where('user', '==', userRef).orderBy('timestamp', 'desc').limit(10);

        this.$bind('user', userRef);
        this.$bind('products', productsRef, { maxRefDepth: 0 });
        this.$bind('audit', auditRef, { maxRefDepth: 1 });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
pre {
  padding: 0.5rem;
  color: yellowgreen;
  font-family: monospace !important;
  background: darkslategray;
}
</style>
