<template>
  <ul v-if="periods" class="tabs">
    <li v-for="period in periods" :key="period.id" v-tooltip.right="periodDates(period)">
      <button
        @click="set_active_period_and_data(period.id)"
        :disabled="activePeriod && period.id === activePeriod.id"
        class="tab"
        :class="{ active: activePeriod && period.id === activePeriod.id }"
      >
        <span
          class="tab__icon"
          :class="activePeriod && period.id === activePeriod.id ? 'fas fa-calendar-alt' : 'far fa-calendar'"
        ></span>
        <span class="tab__name">{{ period.name }}</span>
      </button>
    </li>
  </ul>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { periodDates } from '@/util/formatDate';

export default {
  computed: {
    ...mapState(['periods', 'activePeriod']),
  },

  methods: {
    ...mapActions(['set_active_period_and_data']),

    async setPeriod(id) {
      this.loading = true;
      await this.set_active_period_and_data(id);
      this.loading = false;
    },

    periodDates,
  },
};
</script>

<style lang="scss" scoped>
.tab {
  position: relative;
}
</style>
