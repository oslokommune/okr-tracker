<template>
  <div class="action-bar">
    <div class="period-dates" v-if="activePeriod">
      {{ activePeriod.startDate | formatDate }}
      –
      {{ activePeriod.endDate | formatDate }}
    </div>

    <div class="views">
      <button
        v-for="view in views"
        class="view"
        :class="{ active: view.id === activeView }"
        :key="view.id"
        @click="SET_VIEW(view.id)"
      >
        <span class="view__icon"></span>
        <span class="view__name">{{ view.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { format } from 'date-fns';

export default {
  computed: {
    ...mapState(['activePeriod', 'views', 'activeView']),
  },

  methods: {
    ...mapMutations(['SET_VIEW']),
    format,
  },

  filters: {
    formatDate(date) {
      // TODO: Locale
      return format(date.toDate(), 'd MMMM Y');
    },
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

.period-dates {
  margin-bottom: 1.5rem;
  color: $color-grey-700;
  font-size: 0.9em;

  @media screen and (min-width: bp(s)) {
    margin-right: auto;
    margin-bottom: 0;
  }
}

.view {
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.view.active {
  opacity: 1;
}
</style>
