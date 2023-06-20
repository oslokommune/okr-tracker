<template>
  <div class="action-bar">
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

export default {
  name: 'ActionBar',

  computed: {
    ...mapState(['views', 'user']),
  },

  methods: {
    ...mapActions(['update_preferences']),
    updateView(view) {
      this.user.preferences.view = view;
      this.update_preferences();
    },
  },
};
</script>

<style lang="scss" scoped>
.action-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  justify-items: center;
  width: 100%;
  margin-bottom: 2rem;
  text-align: center;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
    margin-bottom: 1rem;
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
