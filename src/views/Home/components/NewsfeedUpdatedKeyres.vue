<template>
  <div class="card" v-if="product && user && key_result">
    <div class="card__user">
      <img class="card__avatar" :src="this.user.photoURL" :alt="this.user.displayName" />
      <div class="card__usertext">
        <span class="card__displayname">{{ this.user.displayName }}</span>
        har oppdatert fremdrift for
        <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: key_result.id } }"
          >et nøkkelresultat</router-link
        >
      </div>
    </div>

    <div class="card__body">
      <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: key_result.id } }">
        {{ key_result.key_result }}
        <ProgressBar class="progress" :keyres="key_result"></ProgressBar>
      </router-link>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import ProgressBar from '@/components/ProgressBar.vue';
import { serializeDocument } from '../../../util/db';

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
  },

  async created() {
    this.user = await db
      .doc(`users/${this.eventData.user}`)
      .get()
      .then(d => d.data());

    this.key_result = await this.eventData.keyres.get().then(serializeDocument);
    console.log(this.key_result);

    // Replace the value from db with the one from the audit log
    this.key_result.currentValue = this.eventData.toValue;

    this.product = await this.eventData.product.get().then(d => d.data());
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.card {
  margin-bottom: 0.75rem;
  border: 1px solid $color-border;
  border-radius: 4px;
  box-shadow: 0 2px 3px rgba(black, 0.1);

  &__user {
    display: flex;
    align-items: flex-start;
    padding-bottom: 1rem;
    border-bottom: 1px solid $color-border;
  }

  &__usertext {
    display: inline;
  }

  &__avatar {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    margin-top: -0.27rem;
    margin-right: 0.75rem;
    border-radius: 1rem;
  }

  &__displayname {
    font-weight: 500;
  }

  &__body {
    padding: 0.75rem 0;
    font-weight: 500;
    font-size: 1rem;

    a {
      color: black !important;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.progress {
  margin: 1rem 0 0.5rem;
}
</style>
