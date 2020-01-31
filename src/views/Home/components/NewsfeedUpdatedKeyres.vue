<template>
  <div class="nf-card" v-if="product && user && keyResult">
    <div class="nf-card__user">
      <img class="nf-card__avatar" :src="this.user.photoURL" :alt="this.user.displayName" />
      <div class="nf-card__usertext">
        <span class="nf-card__displayname">{{ this.user.displayName }}</span>
        har oppdatert fremdrift for
        <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }"
          >et nøkkelresultat</router-link
        >
      </div>
    </div>

    <div class="nf-card__body">
      <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
        {{ keyResult.description }}
        <ProgressBar class="nf-progress" :keyres="keyResult"></ProgressBar>
      </router-link>
    </div>
    <newsfeed-footer :data="eventData"></newsfeed-footer>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import ProgressBar from '@/components/ProgressBar.vue';
import { serializeDocument } from '../../../util/db';
import NewsfeedFooter from './NewsfeedFooter.vue';

export default {
  data: () => ({
    user: null,
    keyResult: null,
    product: null,
  }),
  props: {
    eventData: {
      type: Object,
      required: true,
    },
  },

  components: {
    ProgressBar,
    NewsfeedFooter,
  },

  async created() {
    this.user = await db
      .doc(`users/${this.eventData.user}`)
      .get()
      .then(d => d.data())
      .catch(this.$errorHandler);

    this.keyResult = await this.eventData.keyres
      .get()
      .then(serializeDocument)
      .catch(this.$errorHandler);

    // Replace the value from db with the one from the audit log
    this.keyResult.currentValue = this.eventData.toValue;

    this.product = await this.eventData.product
      .get()
      .then(d => d.data())
      .catch(this.$errorHandler);
  },
};
</script>
