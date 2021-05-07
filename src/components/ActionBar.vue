<template>
  <div class="action-bar">
    <div v-if="activePeriod" class="action-bar__period-dates">{{ periodDates(activePeriod) }}</div>

    <div class="views">
      <button
        v-for="view in views"
        :key="view.id"
        v-tooltip.top="$t('tooltip.changeView', { view: view.label })"
        class="action-bar__view"
        :class="{ active: view.id === user.preferences.view }"
        @click="updateView(view.id)"
      >
        <span>{{ view.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { periodDates } from '@/util/formatDate';

export default {
  name: 'ActionBar',

  computed: {
    ...mapState(['activePeriod', 'views', 'user']),
  },

  mounted() {
    console.log(this.activePeriod)
  },

  methods: {
    ...mapActions(['update_preferences']),
    updateView(view) {
      this.user.preferences.view = view;
      this.update_preferences();
    },
    periodDates,
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-items: center;
  width: 100%;
  margin-bottom: 2rem;
  text-align: center;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
    margin-bottom: 1rem;
  }
}

.action-bar__period-dates {
  margin-bottom: 1.5rem;
  color: $color-grey-700;
  font-size: 0.9em;

  @media screen and (min-width: bp(s)) {
    margin-right: auto;
    margin-bottom: 0;
  }
}

.action-bar__view {
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.action-bar__view.active {
  opacity: 1;
}
</style>
