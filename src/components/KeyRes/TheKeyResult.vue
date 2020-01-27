<template>
  <div class="keyres">
    <router-link
      class="keyres__text"
      :to="{ name: 'key-result', params: { keyresid: keyres.id } }"
      v-tooltip.left="`Vis detaljer`"
    >
      <div class="keyres__name">{{ keyres.key_result }}</div>
      <div class="keyres__edited edited">Sist oppdatert {{ edited }}</div>
    </router-link>

    <div class="keyres__bar" v-tooltip.left="`${percentage}`">
      <progress-bar :keyres="keyres"></progress-bar>
    </div>
  </div>
</template>

<script>
import { scaleLinear, format } from 'd3';
import ProgressBar from '../ProgressBar.vue';
import { timeFromNow } from '../../util/utils';

export default {
  name: 'TheKeyResult',

  computed: {
    edited() {
      if (!this.keyres) return null;
      const timestamp = this.keyres.edited || this.keyres.created;
      return timeFromNow(timestamp.toDate());
    },

    percentage() {
      const scale = scaleLinear().domain([this.keyres.start_value, this.keyres.target_value]);
      const percentage = scale(this.keyres.currentValue);

      return format('~p')(percentage);
    },
  },

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  components: {
    ProgressBar,
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.keyres {
  display: grid;
  grid-gap: 0 2rem;
  grid-template-columns: 1fr 300px;
  align-content: center;
  align-items: center;
  padding: 0.5rem 0;
  border-top: 1px solid $color-border;

  &:last-child {
    border-bottom: 1px solid $color-border;
  }

  &__text {
    grid-row: 1;
    align-content: center;
    margin-left: -0.5rem;
    padding-left: 0.5rem;
  }

  &__edited {
    grid-row: 2;
    grid-column: 1;
    padding-top: 0.15rem;
  }

  &__bar {
    grid-row: 1 / span all;
    grid-column: 2;
    align-self: start;
    padding: 0.25rem 0;
  }
}
</style>
