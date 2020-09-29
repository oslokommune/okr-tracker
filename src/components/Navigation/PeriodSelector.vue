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
