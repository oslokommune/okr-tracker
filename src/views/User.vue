<template>
  <div v-if="user">
    <h1 class="title-1">{{ user.displayName || user.email }}</h1>

    <button v-if="me">Edit</button>

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

export default {
  data: () => ({
    user: null,
    products: [],
    audit: [],
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
