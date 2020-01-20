<template>
  <div class="keyres">
    <router-link class="keyres__name" :to="{ name: 'key-result', params: { keyresid: keyres.id } }">{{
      keyres.key_result
    }}</router-link>
    <progress-bar class="keyres__bar" :keyres="keyres"></progress-bar>
  </div>
</template>

<script>
import ProgressBar from '@/components/ProgressBar.vue';

export default {
  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  components: {
    ProgressBar,
  },

  mounted() {
    console.log(this.keyres);
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.keyres {
  display: grid;
  grid-gap: 2rem;
  grid-template-columns: 1fr 300px;
  align-items: center;
  padding: 0.5rem 0;
  border-top: 1px solid $color-border;

  &:last-child {
    border-bottom: 1px solid $color-border;
  }
}
</style>
