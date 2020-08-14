<template>
  <ul v-if="periods && activePeriod" class="tabs">
    <li v-for="period in periods" :key="period.id">
      <button
        @click="set_active_period_and_data(period.id)"
        :disabled="period.id === activePeriod.id"
        class="tab"
        :class="{ active: period.id === activePeriod.id }"
      >
        <span
          class="tab__icon"
          :class="period.id === activePeriod.id ? 'fas fa-calendar-alt' : 'far fa-calendar'"
        ></span>
        <span class="tab__name">{{ period.name }}</span>
      </button>
    </li>
  </ul>
</template>

<script>
import { mapState, mapActions } from 'vuex';

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
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.tabs {
  display: flex;
  margin: 1rem 0;
  border-bottom: 1px solid $color-grey-200;
}

.tab {
  padding: 0.5rem 0.5rem;
  color: $color-grey-700;
  font-weight: 500;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;

  &.active {
    color: $color-grey-900;
    border-bottom-color: black;
  }
}

.tab__icon {
  margin-right: 0.35rem;
  color: $color-grey-700;
}
</style>
