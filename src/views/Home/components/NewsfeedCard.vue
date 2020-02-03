<template>
  <div class="nf-card" v-if="ready">
    <div class="nf-card__user">
      <img
        class="nf-card__avatar"
        :src="this.user.photoURL || '/placeholder-user.svg'"
        :alt="this.user.displayName || this.user.email"
      />
      <div class="nf-card__usertext">
        <span class="nf-card__displayname">{{ this.user.displayName || this.user.email }}</span>

        <span v-if="eventData.event === 'keyRes-update-progress'">
          har oppdatert fremdrift for
          <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
            et nøkkelresultat
          </router-link>
          for
          <router-link :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</router-link>
        </span>

        <span v-if="eventData.event === 'promoted-admin'">
          fikk admintilgang
        </span>

        <span v-if="eventData.event === 'deleted-user'"> fjernet bruker {{ eventData.affectedUser }} </span>

        <span v-if="eventData.event === 'added-users'">
          har invitert
          <strong v-tooltip="JSON.parse(eventData.list).join('<br>')"
            >{{ JSON.parse(eventData.list).length }}
            {{ JSON.parse(eventData.list).length === 1 ? 'bruker' : 'brukere' }}
          </strong>
        </span>

        <span v-if="eventData.event === 'demoted-admin'">
          mistet admintilgang
        </span>

        <span v-if="eventData.event === 'create-key-result'">
          opprettet
          <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
            et nøkkelresultat
          </router-link>
          for
          <router-link :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</router-link>
        </span>
      </div>
    </div>

    <div v-if="hasBody" class="nf-card__body">
      <template v-if="eventData.event === 'keyRes-update-progress'">
        <router-link :to="{ name: 'key-result', params: { slug: product.slug, keyresid: keyResult.id } }">
          {{ keyResult.description }}
          <ProgressBar class="nf-progress" :keyres="keyResult"></ProgressBar>
        </router-link>
      </template>
    </div>
    <newsfeed-footer :data="eventData"></newsfeed-footer>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '../../../util/db';
import ProgressBar from '@/components/ProgressBar.vue';
import NewsfeedFooter from './NewsfeedFooter.vue';

export default {
  components: {
    ProgressBar,
    NewsfeedFooter,
  },

  data: () => ({
    user: null,
    product: null,
    keyResult: null,
    ready: false,
    hasBody: false,
  }),

  props: {
    eventData: {
      type: Object,
      required: true,
    },
  },

  async created() {
    const { user, keyresRef, productRef } = this.eventData;

    if (user) {
      this.user = await db
        .doc(`users/${user}`)
        .get()
        .then(d => ({ email: user, ...d.data() }))
        .catch(this.$errorHandler);
    }

    if (keyresRef) {
      this.keyResult = await keyresRef
        .get()
        .then(serializeDocument)
        .catch(this.$errorHandler);

      // Replace the value from db with the one from the audit log
      this.keyResult.currentValue = this.eventData.toValue;
    }

    if (productRef) {
      this.product = await productRef
        .get()
        .then(d => d.data())
        .catch(this.$errorHandler);
    }

    if (this.eventData.event === 'keyRes-update-progress') {
      this.hasBody = true;
    }

    this.ready = true;
  },
};
</script>
