<template>
  <div class="action-bar">
    <div class="period-dates" v-if="activePeriod">
      {{ activePeriod.startDate | formatDate }}
      –
      {{ activePeriod.endDate | formatDate }}
    </div>

    <div class="actions">
      <button
        v-for="action in actions"
        class="action"
        :class="{ active: action.id === activeView }"
        :key="action.id"
        @click="setView(action.id)"
      >
        <span class="action__icon"></span>
        <span class="action__name">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { format } from 'date-fns';

export default {
  data: () => ({
    activeView: 'compact',
    actions: [
      { label: 'Kompakt', id: 'compact', icon: '' },
      { label: 'Detaljer', id: 'details', icon: '' },
      { label: 'Utvided', id: 'expanded', icon: '' },
    ],
  }),

  computed: {
    ...mapState(['activePeriod']),
  },

  methods: {
    setView(view) {
      this.activeView = view;
    },
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

.action {
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.6;
}

.action.active {
  opacity: 1;
}
</style>
