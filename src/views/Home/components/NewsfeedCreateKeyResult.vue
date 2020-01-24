<template>
  <div class="nf-card" v-if="ready">
    <div class="nf-card__user">
      <img class="nf-card__avatar" :src="user.photoURL || '/placeholder-user.svg'" :alt="user.displayName" />
      <div class="nf-card__usertext">
        <span class="nf-card__displayname">{{ user.displayName }}</span>
        har opprettet et nytt nøkkelresultat for
        <router-link :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</router-link>
      </div>
    </div>
    <div class="nf-card__body">«{{ keyRes.key_result }}»</div>
    <newsfeed-footer :data="eventData"></newsfeed-footer>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '@/util/db';
import NewsfeedFooter from './NewsfeedFooter.vue';

export default {
  data: () => ({
    ready: false,
    user: null,
    keyRes: null,
    product: null,
  }),

  components: {
    NewsfeedFooter,
  },

  props: {
    eventData: {
      type: Object,
      required: true,
    },
  },

  async created() {
    this.user = await db
      .doc(`users/${this.eventData.user}`)
      .get()
      .then(snapshot => snapshot.data());

    this.product = await this.eventData.productRef.get().then(serializeDocument);
    this.keyRes = await this.eventData.keyresRef.get().then(serializeDocument);
    this.ready = true;
  },
};
</script>
