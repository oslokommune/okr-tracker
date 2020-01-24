<template>
  <div class="nf-card" v-if="product && user && key_result">
    <div class="nf-card__user">
      <img class="nf-card__avatar" :src="this.user.photoURL" :alt="this.user.displayName" />
      <div class="nf-card__usertext">
        <span class="nf-card__displayname">{{ this.user.displayName }}</span>
        har oppdatert fremdrift for
        <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: key_result.id } }"
          >et nøkkelresultat</router-link
        >
      </div>
    </div>

    <div class="nf-card__body">
      <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: key_result.id } }">
        {{ key_result.key_result }}
        <ProgressBar class="nf-progress" :keyres="key_result"></ProgressBar>
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
    key_result: null,
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
      .then(d => d.data());

    this.key_result = await this.eventData.keyres.get().then(serializeDocument);

    // Replace the value from db with the one from the audit log
    this.key_result.currentValue = this.eventData.toValue;

    this.product = await this.eventData.product.get().then(d => d.data());
  },
};
</script>
