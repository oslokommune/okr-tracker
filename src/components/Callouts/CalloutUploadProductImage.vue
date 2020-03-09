<template>
  <div class="callout" v-if="show">
    <div class="callout__message">
      Her mangler det et produktbilde. Vil du laste opp et?
    </div>
    <div class="callout__actions">
      <router-link :to="{ name: 'edit-product' }" class="btn btn--borderless">Let’s go!</router-link>
      <button @click="close(false)" class="btn btn--borderless">Lukk</button>
      <button @click="close(true)" class="btn btn--borderless">Lukk og ikke vis igjen</button>
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
