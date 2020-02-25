<template>
  <div class="callout" v-if="isMember && show && !stored">
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
    show: true,
  }),
  computed: {
    ...mapState(['user', 'product']),

    isMember() {
      if (!this.product || !this.product.team || !this.product.team.length || !this.user) return;
      return this.product.team.map(d => d.id).includes(this.user.id);
    },

    stored() {
      return localStorage.getItem(`${this.product.name}-hide-callout`);
    },
  },

  methods: {
    close(forever = false) {
      this.show = false;

      if (forever) {
        localStorage.setItem(`${this.product.name}-hide-callout`, 'true');
      }
    },
  },
};
</script>
