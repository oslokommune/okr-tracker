<template>
  <div class="action-bar">
    <div v-if="activePeriod" class="action-bar__period-dates">
      {{ periodDates(activePeriod) }}
    </div>

    <div class="views">
      <button
        v-for="view in _views"
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
import i18n from '@/locale/i18n';
import { mapState, mapActions } from 'vuex';
import { periodDates } from '@/util';

export default {
  name: 'ActionBar',

  computed: {
    ...mapState(['activePeriod', 'views', 'user']),

    _views() {
      /*
       * XXX: Super admin feature preview. Open it up by extending `views` in
       * `src/store/index.js` instead when/if it becomes ready.
       */
      if (this.user.superAdmin) {
        return this.views.concat({ id: 'timeline', label: i18n.t('view.timeline') });
      }

      return this.views;
    },
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
  color: var(--color-primary);
  font-size: 0.9em;

  @media screen and (min-width: bp(s)) {
    margin-right: auto;
    margin-bottom: 0;
  }
}

.action-bar__view {
  color: var(--color-primary);
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
