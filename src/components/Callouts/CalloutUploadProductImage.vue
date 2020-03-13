<template>
  <div class="callout" v-if="show">
    <div class="callout__message">
      {{ $t('toaster.calloutPictures.information') }}
    </div>
    <div class="callout__actions">
      <router-link :to="{ name: 'edit-product' }" class="btn btn--borderless">
        {{ $t('toaster.calloutPictures.yes') }}
      </router-link>
      <button @click="close(false)" class="btn btn--borderless">{{ $t('toaster.calloutPictures.no') }}</button>
      <button @click="close(true)" class="btn btn--borderless">{{ $t('toaster.calloutPictures.never') }}</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  data: () => ({
    isClosed: false,
  }),
  computed: {
    ...mapState(['user', 'product']),

    isMember() {
      if (!this.product || !this.product.team || !this.product.team.length || !this.user) return;
      return this.product.team.map(d => d.id).includes(this.user.id);
    },

    hasImage() {
      return this.product && this.product.photoURL;
    },

    stored() {
      return localStorage.getItem(`${this.product.name}-hide-callout`);
    },

    show() {
      return this.isMember && !this.isClosed && !this.stored && !this.hasImage;
    },
  },

  methods: {
    close(forever = false) {
      this.isClosed = true;

      if (forever) {
        localStorage.setItem(`${this.product.name}-hide-callout`, 'true');
      }
    },
  },
};
</script>
